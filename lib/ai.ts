import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

export async function parseJobWithAI(emailSubject: string, emailBody: string, sender: string) {
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

    Rules:
    - isJobApplication: true if it's a job application email (applied, interview, or rejected).
    - status: Use "applied" for confirmations, "ongoing" for interviews, "rejected" for rejections.
    - If isJobApplication is false, just return {"isJobApplication": false}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "minimaxai/minimax-m2.7",
      messages: [
        { role: "system", content: "You are a professional assistant that extracts job application data into JSON format. You MUST return valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 4096,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    
    if (!text) {
      console.error("AI returned an empty response. Full completion object:", JSON.stringify(completion, null, 2));
      throw new Error("AI returned empty content");
    }

    try {
      // 1. Try to find a JSON block using a more precise regex
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }

      let cleanJson = jsonMatch[0];

      // 2. Basic cleanup: remove potential trailing commas before closing braces/brackets
      // which often break JSON.parse but are common in AI outputs
      cleanJson = cleanJson
        .replace(/,\s*\}/g, '}')
        .replace(/,\s*\]/g, ']');

      const data = JSON.parse(cleanJson);
      
      // Validation of required fields
      if (typeof data.isJobApplication !== 'boolean') {
        console.warn("AI response missing isJobApplication boolean, defaulting to false");
        return null;
      }

      if (!data.isJobApplication) return null;
      return data;
    } catch (e) {
      console.error("AI Parsing Error Details:");
      console.error("Raw Text:", text);
      console.error("Error:", e instanceof Error ? e.message : String(e));
      return null;
    }
  } catch (error) {
    console.error("Minimax Parsing Error:", error);
    return null;
  }
}
