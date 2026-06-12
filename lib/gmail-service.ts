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

  // 1. DEBUG: Broadest possible search (No filters, last 5 messages)
  console.log("Sync: Searching for last 5 messages with NO filter for deep debug...");
  const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5`;

  const searchResponse = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${account.access_token}` },
  });

  if (!searchResponse.ok) {
    throw new Error("Failed to search Gmail messages");
  }

  const searchData = await searchResponse.json();
  const messages: GmailMessage[] = searchData.messages || [];
  console.log(`Sync: Found ${messages.length} potential job emails to analyze with AI`);

  // Process messages in chronological order (oldest first) 
  // so that the most recent status update wins.
  const chronologicalMessages = [...messages].reverse();

  const processedJobs: ParsedJob[] = [];

  // 2. Process each message with AI
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

    // For AI, the snippet is often enough, but we try to get body parts if available
    let bodyContent = snippet;
    if (fullMsg.payload.parts) {
      const parts: GmailPart[] = fullMsg.payload.parts;
      const textPart = parts.find((p) => p.mimeType === "text/plain");
      if (textPart && textPart.body.data) {
        bodyContent = Buffer.from(textPart.body.data, "base64").toString().substring(0, 1000);
      }
    }

    // Call our new async AI parser
    const parsed = await parseJobEmail(subject, bodyContent, from, date);
    
    if (parsed) {
      console.log(`AI Sync: Successfully identified ${parsed.role} at ${parsed.company} (${parsed.status})`);
      
      const existing = await db.job.findFirst({
        where: {
          userId,
          company: { equals: parsed.company, mode: 'insensitive' },
          role: { equals: parsed.role, mode: 'insensitive' }
        },
        orderBy: { appliedDate: 'desc' }
      });

      if (existing) {
        const shouldUpdateStatus = 
          (existing.status === "applied" && (parsed.status === "ongoing" || parsed.status === "rejected")) ||
          (existing.status === "ongoing" && parsed.status === "rejected");

        if (shouldUpdateStatus) {
          await db.job.update({
            where: { id: existing.id },
            data: { status: parsed.status }
          });
          processedJobs.push({ ...parsed, company: existing.company, role: existing.role });
        }
      } else {
        // Create job regardless of status (applied, ongoing, or rejected)
        await db.job.create({
          data: { ...parsed, userId }
        });
        processedJobs.push(parsed);
      }
    }
  }

  return processedJobs;
}
