import { Job } from "@/types/job";

export const INITIAL_JOBS: Job[] = [
  {
    id: 1,
    company: "Vercel",
    role: "Senior Frontend Engineer",
    status: "ongoing",
    appliedDate: "2026-06-05",
    socials: { linkedin: "https://linkedin.com", email: "hiring@vercel.com", x: "https://x.com" },
    notes: "First interview scheduled for next week."
  },
  {
    id: 2,
    company: "Linear",
    role: "Product Designer",
    status: "applied",
    appliedDate: "2026-06-01",
    socials: { linkedin: "https://linkedin.com", email: "jobs@linear.app" },
    notes: ""
  },
  {
    id: 3,
    company: "Stripe",
    role: "Fullstack Engineer",
    status: "ghosted",
    appliedDate: "2026-05-15",
    socials: { linkedin: "https://linkedin.com", x: "https://x.com" },
    notes: "Followed up twice, no response."
  },
  {
    id: 4,
    company: "OpenAI",
    role: "AI Research Engineer",
    status: "rejected",
    appliedDate: "2026-05-10",
    socials: { linkedin: "https://linkedin.com", x: "https://x.com" },
    notes: "Standard rejection email."
  },
  {
    id: 5,
    company: "GitHub",
    role: "Software Engineer",
    status: "ongoing",
    appliedDate: "2026-06-08",
    socials: { linkedin: "https://linkedin.com", email: "recruiting@github.com" },
    notes: ""
  }
];
