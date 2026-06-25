import { parseJobWithAI } from "./ai";

export interface ParsedJob {
  company: string;
  role: string;
  platform: string;
  status: "applied" | "ongoing" | "rejected";
  appliedDate: Date;
  notes?: string;
  contactEmail?: string | null;
}

/**
 * AI-powered email parser.
 * Replaces old regex logic with AI for high-accuracy extraction.
 */
export async function parseJobEmail(subject: string, body: string, sender: string, fallbackDate?: Date): Promise<ParsedJob | null> {
  // Quick heuristic check to filter out obvious recommendations/alerts
  const lowerSubject = subject.toLowerCase();
  const lowerBody = body.toLowerCase();
  
  const isRecommendation = 
    lowerSubject.includes("jobs you might like") ||
    lowerSubject.includes("recommended jobs") ||
    lowerSubject.includes("new jobs matching") ||
    lowerSubject.includes("job alert") ||
    lowerSubject.includes("potential candidate") ||
    lowerSubject.includes("new jobs for you") ||
    lowerSubject.includes("recommended jobs for you") ||
    lowerBody.includes("based on your profile") ||
    lowerBody.includes("we thought you might be interested") ||
    lowerBody.includes("you'd be a great fit for these jobs") ||
    lowerBody.includes("suggested for you") ||
    lowerBody.includes("view more jobs");

  if (isRecommendation && !lowerSubject.includes("application")) {
    return null;
  }

  // Use AI to extract structured data (truncating the body to avoid token bloat/speed issues)
  const aiResult = await parseJobWithAI(subject, body.substring(0, 2000), sender);

  if (!aiResult || !aiResult.company || aiResult.company === "Unknown") {
    return null;
  }

  const extractedDate = aiResult.appliedDate ? new Date(aiResult.appliedDate) : null;
  const isValidDate = extractedDate && !isNaN(extractedDate.getTime());

  // Override status to "rejected" if "unfortunately" is encountered in the email body
  const isRejected = lowerBody.includes("unfortunately");
  const finalStatus = isRejected ? "rejected" : (aiResult.status || "applied");

  return {
    company: aiResult.company,
    role: aiResult.role || "Unknown Position",
    platform: aiResult.platform || "Direct",
    status: finalStatus,
    appliedDate: isValidDate ? extractedDate : (fallbackDate || new Date()), 
    notes: "",
    contactEmail: aiResult.contactEmail
  };
}
