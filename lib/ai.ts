import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function parseJobWithAI(emailSubject: string, emailBody: string, sender: string, retryCount = 0): Promise<any> {
  const apiKey = process.env.MINIMAX_API_KEY;
  
  if (!apiKey) {
    console.error("MINIMAX_API_KEY is missing in environment variables");
    return null;
  }

  const prompt = `
    Extract job application details from this email into JSON format.
    
    Email Subject: ${emailSubject}
    Email From: ${sender}
    Email Body: ${emailBody}

    Your response must be a valid JSON object like this:
    {
      "isJobApplication": true,
      "company": "Company Name",
      "role": "Job Title",
      "status": "applied", 
      "platform": "LinkedIn",
      "appliedDate": "2026-06-16",
      "contactEmail": "recruiter@example.com"
    }

    IMPORTANT: Return ONLY the JSON object. Do not include any explanations, reasoning, or preamble.

    Rules for 'isJobApplication':
    - Set to true ONLY if the email is a direct result of a specific application the user made (e.g., "Application Received", "Thank you for applying", "Interview Invitation", "Status Update", "Application Rejected").
    - Set to false for:
      - Job recommendations like "Jobs you might like" or "You'd be a great fit for these jobs".
      - Emails suggesting "Potential candidate" or "We found a match for you" where no application has been submitted yet.
      - Emails containing multiple job listings or "View more jobs".
      - General job alerts, newsletters, or marketing from LinkedIn, Indeed, Glassdoor, etc.
    - If isJobApplication is false, just return {"isJobApplication": false}

    Rules for 'status':
    - "applied": Use ONLY for confirmation that an application was actually submitted or received.
    - "ongoing": Use for interview invites, scheduling, or follow-ups during the hiring process.
    - "rejected": Use for clear rejection notices.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "minimaxai/minimax-m2.7",
      messages: [
        { role: "system", content: "You are a professional assistant that extracts job application data into JSON format. You MUST return valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1, // Lower temperature for more consistent/faster JSON
      max_tokens: 500,  // Reduced from 4096
    });

    const message = completion.choices[0]?.message;
    let text = message?.content?.trim() || "";
    
    // Fallback: Some models might put the result in reasoning_content if they get "stuck" 
    // or if the prompt is interpreted as a reasoning task.
    if (!text && (message as any).reasoning_content) {
      console.log("AI: content empty, falling back to reasoning_content");
      text = (message as any).reasoning_content.trim();
    }

    if (!text) {
      console.error("AI returned an empty response. Full message object:", JSON.stringify(message));
      return null;
    }

    try {
      // Find the first { and the last } to extract the JSON object
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No JSON object found in response");
      }

      const jsonStr = text.substring(firstBrace, lastBrace + 1);
      const data = JSON.parse(jsonStr);
      
      if (typeof data.isJobApplication !== 'boolean') return null;
      if (!data.isJobApplication) return null;
      return data;
    } catch (e) {
      console.error("AI JSON Parse Error:", e instanceof Error ? e.message : String(e));
      console.error("Raw text was:", text);
      return null;
    }
  } catch (error: any) {
    // Handle 429 Too Many Requests
    if (error.status === 429 && retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
      console.warn(`Rate limit hit (429). Retrying in ${delay}ms... (Attempt ${retryCount + 1}/3)`);
      await sleep(delay);
      return parseJobWithAI(emailSubject, emailBody, sender, retryCount + 1);
    }

    console.error("Minimax Parsing Error:", error.message || error);
    return null;
  }
}
