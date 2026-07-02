import OpenAI from "openai";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (openaiClient) return openaiClient;

  const apiKey = process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    throw new Error("AI API Key is missing in environment variables");
  }

  openaiClient = new OpenAI({
    apiKey,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 30000, // Increased timeout to 30s to prevent timeouts
  });

  return openaiClient;
}

export async function parseJobWithAI(emailSubject: string, emailBody: string, sender: string, retryCount = 0): Promise<any> {
  const apiKey = process.env.MINIMAX_API_KEY;
  
  if (!apiKey) {
    console.error("AI API Key is missing in environment variables");
    return null;
  }

  const prompt = `
Extract job application details from the following email.
Subject: ${emailSubject}
From: ${sender}
Body: ${emailBody}

Respond with a raw, valid JSON object matching this schema:
{
  "isJobApplication": boolean, // true ONLY if this is a direct application confirmation, update, interview, or rejection. false for newsletters, digests, recommendations, or alerts.
  "company": string,           // Name of the employer (not the job board/platform). Clean common corporate suffixes (like "Inc.", "LLC"). Default "Unknown".
  "role": string,              // Job title/position. Default "Unknown".
  "status": "applied" | "ongoing" | "rejected", // "applied" for receipt/confirmation, "ongoing" for interview/test/schedule, "rejected" for rejections.
  "platform": string,          // Platform used (e.g., "LinkedIn", "Indeed", "Wellfound", "Glassdoor", or "Direct").
  "appliedDate": string,       // Application or email date in YYYY-MM-DD.
  "contactEmail": string | null, // Recruiter's or contact email address if visible.
  "linkedinUrl": string | null // LinkedIn URL of the recruiter/hiring manager if visible.
}

RULES:
- Return ONLY valid JSON. No explanations, no markdown blocks (do NOT wrap in \`\`\`json).
- If isJobApplication is false, return {"isJobApplication": false}.
`;

  try {
    const client = getOpenAIClient();
    const AI_MODEL = "meta/llama-3.1-70b-instruct";

    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: "You are a professional assistant that extracts job application data into JSON format. You MUST return valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1, // Lower temperature for more consistent/faster JSON
      max_tokens: 2048,
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

