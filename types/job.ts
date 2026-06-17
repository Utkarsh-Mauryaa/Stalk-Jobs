export type Socials = {
  linkedin?: string;
  email?: string;
  x?: string;
};

export type JobStatus = "applied" | "ongoing" | "ghosted" | "rejected";

export type EmailInteraction = {
  id: string;
  messageId: string;
  subject: string;
  date: string;
};

export type Job = {
  id: string;
  company: string;
  role: string;
  platform: string;
  status: JobStatus;
  appliedDate: string;
  socials: Socials;
  notes: string;
  autoGhostDays: number;
  interactionCount: number;
  lastInteractionAt: string;
  contactEmail?: string | null;
  processedMessageIds: string[];
  threadId?: string | null;
  interactions?: EmailInteraction[];
};
