import { db } from "@/lib/db";
import { parseJobEmail, ParsedJob } from "./job-parser";

interface GmailMessage {
  id: string;
  threadId: string;
}

export async function syncGmailJobs(userId: string) {
  // 1. Get the access token
  const account = await db.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });

  if (!account?.access_token) {
    throw new Error("No Google account connected");
  }

  // 2. Search for job emails (DEBUG: Broaden to last 5 emails to see what's in the inbox)
  console.log("Sync: Searching for last 5 emails to debug...");
  const debugUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5`;
  
  const searchResponse = await fetch(debugUrl, {
    headers: { Authorization: `Bearer ${account.access_token}` },
  });

  if (!searchResponse.ok) {
    throw new Error("Failed to search Gmail messages");
  }

  const searchData = await searchResponse.json();
  const messages: GmailMessage[] = searchData.messages || [];
  console.log(`Sync: Found ${messages.length} total recent messages`);

  const processedJobs: ParsedJob[] = [];

  // 3. Process each message
  for (const msg of messages) {
    const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`;
    const detailResponse = await fetch(detailUrl, {
      headers: { Authorization: `Bearer ${account.access_token}` },
    });

    if (!detailResponse.ok) {
      console.log(`Sync: Failed to fetch details for message ${msg.id}`);
      continue;
    }

    const fullMsg = await detailResponse.json();
    const headers = fullMsg.payload.headers;
    const subject = headers.find((h: any) => h.name === "Subject")?.value || "";
    const from = headers.find((h: any) => h.name === "From")?.value || "";
    
    console.log(`Sync: Found email in inbox -> Subject: "${subject}" | From: "${from}"`);

    // Use a very broad query check for debug
    const testKeywords = ["applied", "application", "job", "thank", "interest", "position"];
    const isJobRelated = testKeywords.some(k => subject.toLowerCase().includes(k));

    if (!isJobRelated) {
      console.log(`Sync: Skipping "${subject}" (Not job related)`);
      continue;
    }

    const date = new Date(parseInt(fullMsg.internalDate));
    
    // Simple body extraction (look for snippet or first text part)
    let body = fullMsg.snippet || "";
    if (fullMsg.payload.parts) {
      const textPart = fullMsg.payload.parts.find((p: any) => p.mimeType === "text/plain");
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, "base64").toString();
      }
    }

    const parsed = parseJobEmail(subject, body, from);
    
    if (parsed) {
      console.log(`Sync: SUCCESS! Parsed as ${parsed.role} @ ${parsed.company}`);
      parsed.appliedDate = date; // Use the actual email date
      
      // Check for duplicates before adding
      const existing = await db.job.findFirst({
        where: {
          userId,
          company: parsed.company,
          role: parsed.role,
        }
      });

      if (!existing) {
        await db.job.create({
          data: {
            ...parsed,
            userId,
          }
        });
        console.log(`Sync: Inserted into DB`);
        processedJobs.push(parsed);
      } else {
        console.log(`Sync: Duplicate found, skipping`);
      }
    } else {
      console.log(`Sync: FAILED to parse this email`);
    }
  }

  return processedJobs;
}
