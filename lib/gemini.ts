import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function parseJobWithAI(emailSubject: string, emailBody: string, sender: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing in .env");
    return null;
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    Analyze this email metadata and content to extract job application details.
    Current Date: ${new Date().toISOString().split('T')[0]}
    
    Subject: ${emailSubject}
    From: ${sender}
    Body Snippet: ${emailBody}

    Return a JSON object with:
    {
      "isJobApplication": boolean, // true if confirmation, rejection, or interview invite. false if marketing/suggested job.
      "company": string,
      "role": string,
      "status": "applied" | "ongoing" | "rejected",
      "platform": string,
      "appliedDate": string // format: YYYY-MM-DD, if mentioned in email. If not clearly mentioned, leave empty.
    }

    Rules for status:
    - "applied": confirmation emails.
    - "ongoing": interview invites or scheduling.
    - "rejected": rejections.
    
    If isJobApplication is false, the other fields can be empty.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    const data = JSON.parse(text);
    if (!data.isJobApplication) return null;
    return data;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
}
