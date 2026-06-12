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

  let platform = "Direct";
  let company = "Unknown";
  let role = "Unknown Position";
  let status: "applied" | "ongoing" | "rejected" = "applied";

  // 1. Detect Platform & Initial Company Guess
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

  // 2. Extract Company Name
  // Try to get from sender display name: "Vercel Careers <hr@vercel.com>"
  const senderMatch = sender.match(/^(?:"?([^"<]+)"?\s)?<?([^>]+)>?$/);
  if (senderMatch && senderMatch[1]) {
    const displayName = senderMatch[1].replace(/ (Careers|Recruitment|Team|Jobs|Hiring)/i, "").trim();
    if (displayName && !["LinkedIn", "Indeed", "Wellfound"].includes(displayName)) {
      company = displayName;
    }
  }

  // Fallback for company from domain
  if (company === "Unknown") {
    const domainMatch = sender.match(/@([^.]+)\./);
    if (domainMatch && !["gmail", "outlook", "hotmail", "linkedin", "indeed", "greenhouse", "lever"].includes(domainMatch[1])) {
      company = domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
    }
  }

  // 3. Extract Role & Company from Subject
  // Common patterns in subjects: "Application for [Role]", "Your application for [Role]", "[Role] at [Company]", "Applied to [Company]"
  const subjectPatterns = [
    { pattern: /application (?:for|to) (?:the )?(.+?)(?: position| role)?(?: at| with) (.*)$/i, roles: 1, companies: 2 },
    { pattern: /application (?:for|to) (?:the )?(.+?)(?: position| role)?(?: at| with|$)/i, roles: 1 },
    { pattern: /regarding your (.*) application/i, roles: 1 },
    { pattern: /interest in (?:the )?(.+?)(?: position| role)? at (.*)$/i, roles: 1, companies: 2 },
    { pattern: /Applied to (.*)$/i, companies: 1 },
    { pattern: /Update (?:on|regarding) your (.*) application/i, roles: 1 },
  ];

  for (const { pattern, roles, companies } of subjectPatterns) {
    const match = subject.match(pattern);
    if (match) {
      if (roles && match[roles]) role = match[roles].trim();
      if (companies && match[companies]) company = match[companies].trim();
    }
  }

  // Clean up role (sometimes it captures "Company Name" if it's at the end)
  if (role.toLowerCase().includes(" at ")) {
    const parts = role.split(/ at /i);
    role = parts[0].trim();
    if (company === "Unknown") company = parts[1].trim();
  }

  // 4. Determine Status
  const rejectionKeywords = [
    "unfortunately", "not moving forward", "decided to proceed with other", 
    "another candidate", "not be moving forward", "positions have been filled"
  ];
  const interviewKeywords = [
    "interview", "schedule", "availability", "speak with you", "phone screen",
    "technical assessment", "next steps"
  ];

  if (rejectionKeywords.some(k => lowerBody.includes(k) || lowerSubject.includes(k))) {
    status = "rejected";
  } else if (interviewKeywords.some(k => lowerBody.includes(k) || lowerSubject.includes(k))) {
    status = "ongoing";
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
    appliedDate: new Date(), // We'll override this with the Gmail internalDate
    notes: `Automatically detected from email: "${subject}"`
  };
}
