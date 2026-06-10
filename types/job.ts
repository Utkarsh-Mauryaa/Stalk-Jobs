export type Socials = {
  linkedin?: string;
  email?: string;
  x?: string;
};

export type JobStatus = "applied" | "ongoing" | "ghosted" | "rejected";

export type Job = {
  id: number;
  company: string;
  role: string;
  status: JobStatus;
  appliedDate: string;
  socials: Socials;
  notes: string;
};
