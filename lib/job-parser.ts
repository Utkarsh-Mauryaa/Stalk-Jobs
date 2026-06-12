import { Socials } from "@/types/job";

export interface ParsedJob {
  company: string;
  role: string;
  platform: string;
  status: "applied" | "ongoing" | "rejected";
  appliedDate: Date;
  notes?: string;
}

export function parseJobEmail(subject: string, body: string, sender: string): ParsedJob | null {
  const lowerSubject = subject.toLowerCase();
  const lowerBody = body.toLowerCase();
  const lowerSender = sender.toLowerCase();

  // 0. Marketing / Recommendation Filter
  const marketingKeywords = [
    "match for", "recommended for you", "suggested job", "new job for you",
    "might be interested in", "similar to", "job alert", "daily digest",
    "weekly digest", "you might like"
  ];
  if (marketingKeywords.some(k => lowerSubject.includes(k) || (lowerBody.includes(k) && !lowerBody.includes("thank you for applying")))) {
    console.log(`Parser: Skipping marketing/recommendation email: "${subject}"`);
    return null;
  }

  let platform = "Direct";
  let company = "Unknown";
  let role = "Unknown Position";
  let status: "applied" | "ongoing" | "rejected" = "applied";

  // 1. Extract Role & Company from Subject (HIGHEST PRIORITY)
  const subjectPatterns = [
    { pattern: /application (?:for|to) (?:the )?(.+?)(?: position| role)?(?: at| with) (.*)$/i, roles: 1, companies: 2 },
    { pattern: /application (?:for|to) (?:the )?(.+?)(?: position| role)?(?: at| with|$)/i, roles: 1 },
    { pattern: /regarding (?:your )?(.*) application/i, companies: 1 },
    { pattern: /interest in (?:the )?(.+?)(?: position| role)? at (.*)$/i, roles: 1, companies: 2 },
    { pattern: /Applied to (.*)$/i, companies: 1 },
    { pattern: /Update (?:on|regarding) your (.*) application/i, roles: 1 },
  ];

  for (const { pattern, roles, companies } of subjectPatterns) {
    const match = subject.match(pattern);
    if (match) {
      if (roles && match[roles]) role = match[roles].trim().replace(/[.,!]$/, "");
      if (companies && match[companies]) {
        const extractedCompany = match[companies].trim().replace(/[.,!]$/, "");
        if (extractedCompany.toLowerCase() !== "your") {
          company = extractedCompany;
        }
      }
    }
  }

  // 2. Detect Platform
  if (lowerSender.includes("linkedin.com")) {
    platform = "LinkedIn";
  } else if (lowerSender.includes("indeed.com")) {
    platform = "Indeed";
  } else if (lowerSender.includes("wellfound.com") || lowerSender.includes("angel.co")) {
    platform = "Wellfound";
  } else if (lowerBody.includes("greenhouse.io") || lowerSender.includes("greenhouse-mail.io")) {
    platform = "Greenhouse";
  } else if (lowerBody.includes("lever.co")) {
    platform = "Lever";
  }

  // 3. Extract Company Name from Sender (Fallback)
  if (company === "Unknown") {
    const senderMatch = sender.match(/^(?:"?([^"<]+)"?\s)?<?([^>]+)>?$/);
    if (senderMatch && senderMatch[1]) {
      const displayName = senderMatch[1].replace(/ (Careers|Recruitment|Team|Jobs|Hiring)/i, "").trim();
      if (displayName && !["LinkedIn", "Indeed", "Wellfound", "Utkarsh Maurya"].includes(displayName)) {
        company = displayName;
      }
    }

    if (company === "Unknown") {
      const domainMatch = sender.match(/@([^.]+)\./);
      if (domainMatch && !["gmail", "outlook", "hotmail", "linkedin", "indeed", "greenhouse", "lever"].includes(domainMatch[1])) {
        company = domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
      }
    }
  }

  // Clean up role
  if (role.toLowerCase().includes(" at ")) {
    const parts = role.split(/ at /i);
    role = parts[0].trim().replace(/[.,!]$/, "");
    if (company === "Unknown") company = parts[1].trim().replace(/[.,!]$/, "");
  }

  // Final trim and cleanup for company
  company = company.trim().replace(/[.,!]$/, "");
  role = role.trim().replace(/[.,!]$/, "");

  // 4. Determine Status
  const rejectionKeywords = [
    "unfortunately", "not moving forward", "decided to proceed with other", 
    "another candidate", "not be moving forward", "positions have been filled",
    "rejected", "decline"
  ];
  
  // Refined interview keywords to avoid "invite to apply"
  const interviewKeywords = [
    "interview", "schedule", "availability", "speak with you", "phone screen",
    "technical assessment"
  ];

  if (rejectionKeywords.some(k => lowerBody.includes(k) || lowerSubject.includes(k))) {
    status = "rejected";
  } else if (interviewKeywords.some(k => lowerBody.includes(k) || lowerSubject.includes(k))) {
    status = "ongoing";
  } else if (lowerSubject.includes("invite") || lowerBody.includes("invite")) {
    // Only mark as ongoing if "invite" is paired with "interview" or "talk"
    if (lowerBody.includes("interview") || lowerBody.includes("talk") || lowerBody.includes("chat")) {
      status = "ongoing";
    }
  }

  // Final Validation: If it's a generic "Interest in..." but doesn't mention "Application" 
  // and we don't have a clear company, skip it.
  if (lowerSubject.includes("interest in") && !lowerSubject.includes("application") && company === "Unknown") {
    return null;
  }

  // If we couldn't find a company or role, it might not be a job application email we can parse reliably
  if (company === "Unknown" && role === "Unknown Position") {
    return null;
  }

  return {
    company,
    role,
    platform,
    status,
    appliedDate: new Date(),
    notes: `Automatically detected from email: "${subject}"`
  };
}
