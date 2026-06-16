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

export async function syncGmailJobs(userId: string) {
  const account = await db.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.access_token) {
    throw new Error("No Google account connected");
  }

  // 1. Fetch all processed message IDs for this user to avoid double processing
  const userJobs = await db.job.findMany({
    where: { userId },
    select: { processedMessageIds: true }
  });
  const allProcessedIds = new Set(userJobs.flatMap(j => j.processedMessageIds));

  // 2. Search for job-related emails
  const query = "subject:(application OR interview OR recruiter OR hired OR position OR role OR job)";
  const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`;

  const searchResponse = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${account.access_token}` },
  });

  if (!searchResponse.ok) {
    throw new Error("Failed to search Gmail messages");
  }

  const searchData = await searchResponse.json();
  const messages: GmailMessage[] = searchData.messages || [];
  
  const newMessages = messages.filter(m => !allProcessedIds.has(m.id));
  console.log(`Sync: Found ${messages.length} total, ${newMessages.length} new job emails to analyze`);

  const chronologicalMessages = [...newMessages].reverse();
  const processedJobs: ParsedJob[] = [];

  // 3. Process each message
  for (const msg of chronologicalMessages) {
    const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`;
    const detailResponse = await fetch(detailUrl, {
      headers: { Authorization: `Bearer ${account.access_token}` },
    });

    if (!detailResponse.ok) continue;

    const fullMsg = await detailResponse.json();
    const headers: GmailHeader[] = fullMsg.payload.headers;
    const subject = headers.find((h) => h.name === "Subject")?.value || "";
    const from = headers.find((h) => h.name === "From")?.value || "";
    const date = new Date(parseInt(fullMsg.internalDate));
    const snippet = fullMsg.snippet || "";

    let bodyContent = snippet;
    if (fullMsg.payload.parts) {
      const parts: GmailPart[] = fullMsg.payload.parts;
      const textPart = parts.find((p) => p.mimeType === "text/plain");
      if (textPart && textPart.body.data) {
        const base64 = textPart.body.data.replace(/-/g, '+').replace(/_/g, '/');
        bodyContent = Buffer.from(base64, "base64").toString("utf-8").substring(0, 1500);
      }
    }

    const parsed = await parseJobEmail(subject, bodyContent, from, date);
    
    if (parsed) {
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
            threadId: fullMsg.threadId || existing.threadId
          }
        });
        processedJobs.push({ ...parsed, company: existing.company, role: existing.role });
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
            threadId: fullMsg.threadId
          }
        });
        processedJobs.push(parsed);
      }
    }
  }

  return processedJobs;
}
