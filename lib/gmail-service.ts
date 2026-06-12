import { db } from "@/lib/db";
import { parseJobEmail, ParsedJob } from "./job-parser";

interface GmailMessage {
  id: string;
  threadId: string;
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

  const processedJobs: ParsedJob[] = [];

  // 2. Process each message with AI
  for (const msg of messages) {
    const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`;
    const detailResponse = await fetch(detailUrl, {
      headers: { Authorization: `Bearer ${account.access_token}` },
    });

    if (!detailResponse.ok) continue;

    const fullMsg = await detailResponse.json();
    const headers = fullMsg.payload.headers;
    const subject = headers.find((h: any) => h.name === "Subject")?.value || "";
    const from = headers.find((h: any) => h.name === "From")?.value || "";
    const date = new Date(parseInt(fullMsg.internalDate));
    const snippet = fullMsg.snippet || "";

    // For AI, the snippet is often enough, but we try to get body parts if available
    let bodyContent = snippet;
    if (fullMsg.payload.parts) {
      const textPart = fullMsg.payload.parts.find((p: any) => p.mimeType === "text/plain");
      if (textPart && textPart.body.data) {
        bodyContent = Buffer.from(textPart.body.data, "base64").toString().substring(0, 1000);
      }
    }

    // Call our new async AI parser
    const parsed = await parseJobEmail(subject, bodyContent, from);
    
    if (parsed) {
      console.log(`AI Sync: Successfully identified ${parsed.role} at ${parsed.company} (${parsed.status})`);
      parsed.appliedDate = date; 
      
      const existing = await db.job.findFirst({
        where: {
          userId,
          company: { equals: parsed.company, mode: 'insensitive' }
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
      } else if (parsed.status === "applied") {
        await db.job.create({
          data: { ...parsed, userId }
        });
        processedJobs.push(parsed);
      }
    }
  }

  return processedJobs;
}
