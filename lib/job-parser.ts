import { parseJobWithAI } from "./gemini";

export interface ParsedJob {
  company: string;
  role: string;
  platform: string;
  status: "applied" | "ongoing" | "rejected";
  appliedDate: Date;
  notes?: string;
}

/**
 * AI-powered email parser.
 * Replaces old regex logic with Gemini Flash for high-accuracy extraction.
 */
export async function parseJobEmail(subject: string, body: string, sender: string, fallbackDate?: Date): Promise<ParsedJob | null> {
  // Use AI to extract structured data
  const aiResult = await parseJobWithAI(subject, body, sender);

  if (!aiResult || !aiResult.company || aiResult.company === "Unknown") {
    return null;
  }

  const extractedDate = aiResult.appliedDate ? new Date(aiResult.appliedDate) : null;
  const isValidDate = extractedDate && !isNaN(extractedDate.getTime());

  return {
    company: aiResult.company,
    role: aiResult.role || "Unknown Position",
    platform: aiResult.platform || "Direct",
    status: aiResult.status || "applied",
    appliedDate: isValidDate ? extractedDate : (fallbackDate || new Date()), 
    notes: `Automatically parsed via StalkJobs AI`
  };
}
