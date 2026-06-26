import { db } from "@/lib/db";
import { parseJobEmail, ParsedJob } from "./job-parser";
import { extractRetryAfter } from "./ai";

interface GmailMessage {
  id: string;
  threadId: string;
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailPart {
  mimeType: string;
  body: {
    data?: string;
  };
}

function cleanHtml(html: string): string {
  // Remove style blocks
  let clean = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Remove script blocks
  clean = clean.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  // Replace HTML tags with spaces
  clean = clean.replace(/<[^>]*>/g, ' ');
  // Replace common HTML entities
  clean = clean
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&zwnj;/gi, ' ')
    .replace(/&bull;/gi, '•');
  // Normalize whitespace
  return clean.replace(/\s+/g, ' ').trim();
}

/**
 * Find and decode the message body, prioritizing text/html (cleaned) then text/plain
 */
function getMessageBody(payload: any): string {
  // Direct body (leaf node)
  if (payload.body?.data) {
    const base64 = payload.body.data.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    if (payload.mimeType === "text/html") {
      return cleanHtml(decoded);
    }
    return decoded;
  }

  // Multipart node
  if (payload.parts) {
    // 1. Search for text/html at this level
    for (const part of payload.parts) {
      if (part.mimeType === "text/html") {
        const body = getMessageBody(part);
        if (body) return body;
      }
    }

    // 2. Search for text/plain at this level
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain") {
        const body = getMessageBody(part);
        if (body) return body;
      }
    }

    // 3. Recurse deeper into parts if neither was found at this level
    for (const part of payload.parts) {
      const body = getMessageBody(part);
      if (body) return body;
    }
  }

  return "";
}

/**
 * Refreshes an expired Google access token
 */
async function getValidAccessToken(userId: string) {
  const account = await db.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.refresh_token) {
    return account?.access_token || null;
  }

  // Check if token is expired (with a 1-minute buffer)
  const isExpired = account.expires_at 
    ? (account.expires_at * 1000) < (Date.now() + 60000)
    : false;

  if (!isExpired) {
    return account.access_token;
  }

  console.log("Sync: Access token expired, attempting refresh...");

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        grant_type: "refresh_token",
        refresh_token: account.refresh_token,
      }),
    });

    const tokens = await response.json();

    if (!response.ok) {
      console.error("Sync: Failed to refresh token", tokens);
      return account.access_token; // Return old token as last resort
    }

    // Update the database with new tokens
    await db.account.update({
      where: { id: account.id },
      data: {
        access_token: tokens.access_token,
        expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
        refresh_token: tokens.refresh_token ?? account.refresh_token,
      },
    });

    console.log("Sync: Token refreshed successfully");
    return tokens.access_token;
  } catch (error) {
    console.error("Sync: Error refreshing token:", error);
    return account.access_token;
  }
}

export async function syncGmailJobs(userId: string) {
  const access_token = await getValidAccessToken(userId);

  if (!access_token) {
    throw new Error("No Google account connected or tokens expired");
  }

  // 1. Fetch all processed message IDs for this user to avoid double processing
  const userJobs = await db.job.findMany({
    where: { userId },
    select: { processedMessageIds: true }
  });

const previouslyProcessed = db.processedEmail ? await db.processedEmail.findMany({
  where: { userId },
  select: { messageId: true }
}) : [];

const ignoredThreads = db.ignoredThread ? await db.ignoredThread.findMany({
  where: { userId },
  select: { threadId: true }
}) : [];

const allProcessedIds = new Set([
  ...userJobs.flatMap(j => j.processedMessageIds),
  ...previouslyProcessed.map(p => p.messageId)
]);

const allIgnoredThreadIds = new Set(ignoredThreads.map(t => t.threadId));

  // 2. Search for job-related emails
  // We exclude common marketing/newsletter terms, but we keep rejection terms so we can auto-update statuses
  const query = "subject:(application OR interview OR recruiter OR hired OR position OR role OR job OR applied OR apply) -{newsletter unsubscribe digest \"job alert\" \"daily update\"}";
  const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=100`;
  const searchResponse = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

if (!searchResponse.ok) {
  const errorBody = await searchResponse.text();
  console.error("Gmail Search Error Body:", errorBody);
  throw new Error("Failed to search Gmail messages");
}

const searchData = await searchResponse.json();
const messages: GmailMessage[] = searchData.messages || [];

// Filter messages that are already processed OR belong to an ignored thread
const newMessages = messages.filter(m => !allProcessedIds.has(m.id) && !allIgnoredThreadIds.has(m.threadId));
console.log(`Sync: Found ${messages.length} matching, ${newMessages.length} are new/not ignored`);

// We process the NEWEST messages first as per user request ("next latest")
const messagesToProcess = newMessages.slice(0, 10);  console.log(`Sync: Processing ${messagesToProcess.length} messages...`);

  const results: ParsedJob[] = [];

  for (let i = 0; i < messagesToProcess.length; i++) {
    const msg = messagesToProcess[i];
    try {
      // Add a tiny stagger to avoid all hitting AI at the exact same millisecond
      await new Promise(r => setTimeout(r, 100));

      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`;
      const detailResponse = await fetch(detailUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!detailResponse.ok) continue;
      const fullMsg = await detailResponse.json();

      const headers: GmailHeader[] = fullMsg.payload.headers;
      const subject = headers.find((h) => h.name === "Subject")?.value || "";
      const from = headers.find((h) => h.name === "From")?.value || "";
      const date = new Date(parseInt(fullMsg.internalDate));
      
      const rawBody = getMessageBody(fullMsg.payload);

      const parsed = await parseJobEmail(subject, rawBody, from, date);
      
      if (!parsed) {
        // Classified as not a job application, mark as processed and continue
        if (db.processedEmail) {
          await db.processedEmail.upsert({
            where: { userId_messageId: { userId, messageId: msg.id } },
            update: {},
            create: { userId, messageId: msg.id }
          });
        }
        continue;
      }

      console.log(`Sync: Found job - ${parsed.role} at ${parsed.company}`);
      
      // Look up existing job. Try to match by threadId first, then by company & role
      let existing = null;
      if (fullMsg.threadId) {
        existing = await db.job.findFirst({
          where: {
            userId,
            threadId: fullMsg.threadId
          }
        });
      }
      
      if (!existing) {
        existing = await db.job.findFirst({
          where: {
            userId,
            company: { equals: parsed.company, mode: 'insensitive' },
            role: { equals: parsed.role, mode: 'insensitive' }
          }
        });
      }

      if (existing) {
        const shouldUpdateStatus = 
          (existing.status === "applied" && (parsed.status === "ongoing" || parsed.status === "rejected")) ||
          (existing.status === "ongoing" && parsed.status === "rejected");

        await db.job.update({
          where: { id: existing.id },
          data: { 
            status: shouldUpdateStatus ? parsed.status : existing.status,
            interactionCount: { increment: 1 },
            lastInteractionAt: date,
            processedMessageIds: { push: msg.id },
            contactEmail: parsed.contactEmail || existing.contactEmail,
            threadId: fullMsg.threadId || existing.threadId,
            interactions: {
              create: {
                messageId: msg.id,
                subject: subject,
                date: date,
              }
            }
          }
        });

        // Mark as processed in DB since operations completed successfully
        if (db.processedEmail) {
          await db.processedEmail.upsert({
            where: { userId_messageId: { userId, messageId: msg.id } },
            update: {},
            create: { userId, messageId: msg.id }
          });
        }

        results.push({ ...parsed, company: existing.company, role: existing.role });
      } else {
        if (parsed.status === "rejected") {
          console.log(`Sync: Skipping creation of new untracked rejected job for ${parsed.company}`);
          // Mark as processed so we don't scan it again
          if (db.processedEmail) {
            await db.processedEmail.upsert({
              where: { userId_messageId: { userId, messageId: msg.id } },
              update: {},
              create: { userId, messageId: msg.id }
            });
          }
          continue;
        }

        await db.job.create({
          data: { 
            company: parsed.company,
            role: parsed.role,
            platform: parsed.platform,
            status: parsed.status,
            appliedDate: parsed.appliedDate,
            notes: parsed.notes,
            contactEmail: parsed.contactEmail,
            userId,
            processedMessageIds: [msg.id],
            interactionCount: 1,
            lastInteractionAt: date,
            threadId: fullMsg.threadId,
            interactions: {
              create: {
                messageId: msg.id,
                subject: subject,
                date: date,
              }
            }
          }
        });

        // Mark as processed in DB since operations completed successfully
        if (db.processedEmail) {
          await db.processedEmail.upsert({
            where: { userId_messageId: { userId, messageId: msg.id } },
            update: {},
            create: { userId, messageId: msg.id }
          });
        }

        results.push(parsed);
      }
    } catch (err: any) {
      console.error(`Sync: Error processing ${msg.id}:`, err);
      const isRateLimit = err?.status === 429 || err?.statusCode === 429 || err?.message?.toLowerCase().includes("rate limit") || err?.message?.toLowerCase().includes("too many requests") || err?.message?.includes("429");
      if (isRateLimit) {
        if (!err.status) err.status = 429;
        if (err.retryAfter === undefined) {
          err.retryAfter = extractRetryAfter(err);
        }
        throw err;
      }
    }
  }

  return results;
}
