import OpenAI from "openai";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let openaiClient: OpenAI | null = null;

function getOpenAIClient(isGemini: boolean) {
  if (openaiClient) return openaiClient;

  const apiKey = isGemini ? process.env.GEMINI_API_KEY : process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    throw new Error("AI API Key is missing in environment variables");
  }

  openaiClient = new OpenAI({
    apiKey,
    baseURL: isGemini 
      ? 'https://generativelanguage.googleapis.com/v1beta/openai/' 
      : 'https://integrate.api.nvidia.com/v1',
    timeout: 20000, // 20-second timeout to prevent infinite hang
  });

  return openaiClient;
}

export async function parseJobWithAI(emailSubject: string, emailBody: string, sender: string, retryCount = 0): Promise<any> {
  const isGemini = !!process.env.GEMINI_API_KEY;
  const apiKey = isGemini ? process.env.GEMINI_API_KEY : process.env.MINIMAX_API_KEY;
  
  if (!apiKey) {
    console.error("AI API Key is missing in environment variables");
    return null;
  }

  const prompt = `
    Extract job application details from this email into JSON format.
    
    Email Subject: ${emailSubject}
    Email From: ${sender}
    Email Body: ${emailBody}

    Your response must be a valid JSON object following this schema:
    {
      "isJobApplication": boolean,
      "company": string,
      "role": string,
      "status": "applied" | "ongoing" | "rejected", 
      "platform": string,
      "appliedDate": string, (in YYYY-MM-DD format)
      "contactEmail": string | null,
      "linkedinUrl": string | null
    }

    IMPORTANT RULES:
    1. NEVER use literal placeholders like "Company Name", "Job Title", "LinkedIn", or "recruiter@example.com" unless they are actually the literal values in the email.
    2. Extract the actual values from the Email Subject, From field, and Email Body.
    3. Rules for 'isJobApplication':
       - Set to true ONLY if the email is a direct result of a specific application the user made (e.g., "Application Received", "Thank you for applying", "Interview Invitation", "Status Update", "Application Rejected").
       - Set to false for:
         - Job recommendations like "Jobs you might like" or "You'd be a great fit for these jobs".
         - Emails suggesting "Potential candidate" or "We found a match for you" where no application has been submitted yet.
         - Emails containing multiple job listings or "View more jobs".
         - General job alerts, newsletters, or marketing from LinkedIn, Indeed, Glassdoor, etc.
       - If isJobApplication is false, just return {"isJobApplication": false}
    4. Rules for 'company':
       - Extract the name of the company/employer to which the user applied.
       - Do NOT set to "Indeed" or "LinkedIn" if Indeed/LinkedIn was just the platform used to apply. Look for the employer's name (e.g., if applied to "SFJ Business Solutions" via Indeed, the company is "SFJ Business Solutions").
       - If the email is from a company email address (e.g. recruiting@stripe.com), the company name is Stripe.
       - If the sender display name is the company (e.g. "Chalkys.com" <noreply@indeed.com>), the company is Chalkys.com.
       - If the company name cannot be determined, set this to "Unknown".
    5. Rules for 'role':
       - Extract the job title or role name (e.g. "Backend Developers", "Web Developer Intern", etc.).
       - If the subject is "Indeed Application: Backend Developers", the role is "Backend Developers".
       - If the role name cannot be determined, set this to "Unknown".
    6. Rules for 'platform':
       - Identify the platform used to apply (e.g. "Indeed", "LinkedIn", "Wellfound", "Glassdoor").
       - Check the sender email, subject, and body:
         - If sender is indeedapply@indeed.com or noreply@indeed.com, or the subject/body mentions Indeed, set to "Indeed".
         - If sender is from linkedin.com or the subject/body mentions LinkedIn, set to "LinkedIn".
         - If applied directly or platform is not specified, set to "Direct".
    7. Rules for 'status':
       - "applied": Use for confirmation that an application was submitted or received.
       - "ongoing": Use for interview invites, scheduling, or follow-ups during the hiring process.
       - "rejected": Use for clear rejection notices.
    8. Rules for 'linkedinUrl':
       - Extract the LinkedIn URL of the recruiter, hiring manager, or sender from the email body (especially sign-off/signature blocks) if present.
       - If no LinkedIn URL is found, return null.
    9. Return ONLY the JSON object. Do not include any explanations, reasoning, or markdown formatting blocks (like \`\`\`json).
  `;

  try {
    const client = getOpenAIClient(isGemini);
    const AI_MODEL = isGemini ? "gemini-2.5-flash" : "meta/llama-3.3-70b-instruct";

    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: "You are a professional assistant that extracts job application data into JSON format. You MUST return valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1, // Lower temperature for more consistent/faster JSON
      max_tokens: 2048,
      ...(isGemini ? { response_format: { type: "json_object" } } : {}),
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
    const is429 = error.status === 429 || error.statusCode === 429 || error.message?.toLowerCase().includes("rate limit") || error.message?.toLowerCase().includes("too many requests") || error.message?.includes("429");
    
    if (is429 && retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
      console.warn(`Rate limit hit (429). Retrying in ${delay}ms... (Attempt ${retryCount + 1}/3)`);
      await sleep(delay);
      return parseJobWithAI(emailSubject, emailBody, sender, retryCount + 1);
    }

    if (is429) {
      // Decorate error with status and retryAfter
      error.status = 429;
      error.retryAfter = extractRetryAfter(error);
    }

    console.error("AI Parsing Error:", error.message || error);
    throw error; // Rethrow so the caller knows it failed and doesn't mark the email as processed
  }
}

export function extractRetryAfter(error: any): number {
  if (error.headers) {
    const retryAfterHeader = error.headers['retry-after'];
    if (retryAfterHeader) {
      const parsed = parseInt(retryAfterHeader, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    const resetHeader = error.headers['x-ratelimit-reset'] || error.headers['x-ratelimit-reset-requests'] || error.headers['x-ratelimit-reset-tokens'];
    if (resetHeader) {
      const parsed = parseInt(resetHeader, 10);
      if (!isNaN(parsed) && parsed > 0) {
        if (parsed > 1000000000) {
          const diff = Math.ceil(parsed - Date.now() / 1000);
          return diff > 0 ? diff : 60;
        }
        return parsed;
      }
    }
  }

  if (error.response?.headers) {
    const retryAfter = error.response.headers.get?.('retry-after') || error.response.headers['retry-after'];
    if (retryAfter) {
      const parsed = parseInt(retryAfter, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  const msg = (error.message || "").toLowerCase();

  // 1. Try to find durations after "try again in" or "retry in" or "retry after"
  // Look for combined patterns like "1m5.2s" or "2m 15s"
  const comboMatch = msg.match(/(?:try again in|retry after|retry in|in|after)\s*(\d+)\s*m(?:in|utes?)?\s*(\d+(?:\.\d+)?)\s*s(?:ec|onds?)?/);
  if (comboMatch) {
    const mins = parseInt(comboMatch[1], 10);
    const secs = parseFloat(comboMatch[2]);
    return Math.ceil(mins * 60 + secs);
  }

  // Look for minutes only like "1.5m", "2 minutes", "1 min"
  const minMatch = msg.match(/(?:try again in|retry after|retry in|in|after)\s*(\d+(?:\.\d+)?)\s*m(?:in|utes?)?/);
  if (minMatch) {
    return Math.ceil(parseFloat(minMatch[1]) * 60);
  }

  // Look for seconds only like "5.2s", "30 seconds", "12s", "12 sec"
  const secMatch = msg.match(/(?:try again in|retry after|retry in|in|after)\s*(\d+(?:\.\d+)?)\s*s(?:ec|onds?)?/);
  if (secMatch) {
    return Math.ceil(parseFloat(secMatch[1]));
  }

  // Look for milliseconds only like "5200ms"
  const msMatch = msg.match(/(?:try again in|retry after|retry in|in|after)\s*(\d+(?:\.\d+)?)\s*ms/);
  if (msMatch) {
    return Math.ceil(parseFloat(msMatch[1]) / 1000);
  }

  // 2. Fallbacks (wider checks without "try again" prefix)
  const fallbackCombo = msg.match(/(\d+)\s*(?:minute|min|m)\s*(\d+(?:\.\d+)?)\s*(?:second|sec|s)/);
  if (fallbackCombo) {
    const mins = parseInt(fallbackCombo[1], 10);
    const secs = parseFloat(fallbackCombo[2]);
    return Math.ceil(mins * 60 + secs);
  }

  const fallbackMin = msg.match(/(\d+(?:\.\d+)?)\s*(?:minute|min|m\b)/);
  if (fallbackMin) {
    return Math.ceil(parseFloat(fallbackMin[1]) * 60);
  }

  const fallbackSec = msg.match(/(\d+(?:\.\d+)?)\s*(?:second|sec|s\b)/);
  if (fallbackSec) {
    return Math.ceil(parseFloat(fallbackSec[1]));
  }

  const fallbackHr = msg.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr|h\b)/);
  if (fallbackHr) {
    return Math.ceil(parseFloat(fallbackHr[1]) * 3600);
  }

  return 60; // 60 seconds default
}

