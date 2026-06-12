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
export async function parseJobEmail(subject: string, body: string, sender: string): Promise<ParsedJob | null> {
  // Use AI to extract structured data
  const aiResult = await parseJobWithAI(subject, body, sender);

  if (!aiResult || !aiResult.company || aiResult.company === "Unknown") {
    return null;
  }

  return {
    company: aiResult.company,
    role: aiResult.role || "Unknown Position",
    platform: aiResult.platform || "Direct",
    status: aiResult.status || "applied",
    appliedDate: new Date(), // Overridden by Gmail internalDate in the service
    notes: `Automatically parsed via StalkJobs AI`
  };
}
