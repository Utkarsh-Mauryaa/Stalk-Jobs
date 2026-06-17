import { db } from "@/lib/db";
import { parseJobEmail, ParsedJob } from "./job-parser";

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

/**
 * Recursively find the plain text body in a Gmail message
 */
function getMessageBody(payload: any): string {
  if (payload.body?.data) {
    const base64 = payload.body.data.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, "base64").toString("utf-8");
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain") {
        return getMessageBody(part);
      }
    }
    // If no text/plain found at this level, check deeper
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
// We exclude common marketing/newsletter terms AND rejection terms that might re-trigger deleted jobs
const query = "subject:(application OR interview OR recruiter OR hired OR position OR role OR job) -{newsletter unsubscribe digest \"job alert\" \"daily update\" \"unfortunately\" \"not moving forward\" \"rejected\" \"not selected\"}";
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
const messagesToProcess = newMessages.slice(0, 10);

console.log(`Sync: Processing ${messagesToProcess.length} messages...`);

const results = await Promise.all(
  messagesToProcess.map(async (msg, index) => {
    try {
      // Add a tiny stagger to avoid all hitting AI at the exact same millisecond
      await new Promise(r => setTimeout(r, index * 100));

      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`;
      const detailResponse = await fetch(detailUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!detailResponse.ok) return null;
        const fullMsg = await detailResponse.json();
        
        // Mark as processed immediately so we don't try again if it's not a job
        if (db.processedEmail) {
          await db.processedEmail.upsert({
            where: { userId_messageId: { userId, messageId: msg.id } },
            update: {},
            create: { userId, messageId: msg.id }
          });
        }

        const headers: GmailHeader[] = fullMsg.payload.headers;
        const subject = headers.find((h) => h.name === "Subject")?.value || "";
        const from = headers.find((h) => h.name === "From")?.value || "";
        const date = new Date(parseInt(fullMsg.internalDate));
        
        const bodyContent = getMessageBody(fullMsg.payload).substring(0, 1200);

        const parsed = await parseJobEmail(subject, bodyContent, from, date);
        if (!parsed) return null;

        console.log(`Sync: Found job - ${parsed.role} at ${parsed.company}`);
        
        const existing = await db.job.findFirst({
          where: {
            userId,
            company: { equals: parsed.company, mode: 'insensitive' },
            role: { equals: parsed.role, mode: 'insensitive' }
          }
        });

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
          return { ...parsed, company: existing.company, role: existing.role };
        } else {
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
          return parsed;
        }
      } catch (err) {
        console.error(`Sync: Error processing ${msg.id}:`, err);
        return null;
      }
    })
  );

  return results.filter((j): j is ParsedJob => j !== null);
}
