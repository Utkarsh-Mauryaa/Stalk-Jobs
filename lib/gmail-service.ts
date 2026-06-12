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
      parsed.company = parsed.company.trim(); // Ensure no trailing spaces
      console.log(`Sync: Parsed email. Role: "${parsed.role}", Company: "${parsed.company}"`);
      parsed.appliedDate = date; 
      // 1. LOOK FOR EXISTING MATCH
      // We look for any job at the same company for this user
      // We use a slightly more flexible match to handle variations
      const existing = await db.job.findFirst({
        where: {
          userId,
          OR: [
            { company: { equals: parsed.company, mode: 'insensitive' } },
            { company: { contains: parsed.company, mode: 'insensitive' } }
          ]
        },
        orderBy: {
          appliedDate: 'desc'
        }
      });

      console.log(`Sync: Database lookup for "${parsed.company}" returned: ${existing ? `Match Found (ID: ${existing.id}, Company in DB: "${existing.company}", Status: ${existing.status})` : 'No Match Found'}`);


      if (existing) {
        // If we found an existing application for this company
        // and the new email suggests a status change, update it.
        const shouldUpdateStatus = 
          (existing.status === "applied" && (parsed.status === "ongoing" || parsed.status === "rejected")) ||
          (existing.status === "ongoing" && parsed.status === "rejected");

        if (shouldUpdateStatus) {
          await db.job.update({
            where: { id: existing.id },
            data: { 
              status: parsed.status,
              // Optionally update the role if the original was "Unknown" or generic
              role: existing.role === "Unknown Position" ? parsed.role : existing.role
            }
          });
          console.log(`Sync: Updated status of existing ${parsed.company} job to ${parsed.status}`);
          processedJobs.push({ ...parsed, company: existing.company, role: existing.role });
        } else {
          console.log(`Sync: Existing ${parsed.company} job is already up to date`);
        }
      } else {
        // 2. CREATE NEW ENTRY
        await db.job.create({
          data: {
            ...parsed,
            userId,
          }
        });
        console.log(`Sync: Inserted new job for ${parsed.company} into DB`);
        processedJobs.push(parsed);
      }
    } else {
      console.log(`Sync: FAILED to parse this email`);
    }
  }

  return processedJobs;
}
