"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Job, JobStatus, Socials } from "@/types/job"

export type JobFormData = {
  company: string;
  role: string;
  platform: string;
  status: JobStatus;
  appliedDate: string;
  socials: Socials;
  notes: string;
  autoGhostDays: number;
};

const PLATFORMS = ["LinkedIn", "Indeed", "Wellfound", "Glassdoor"]

interface JobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (job: JobFormData) => void
  initialJob?: Job | null
  today: string
  title: string
  description: string
}

export function JobDialog({ open, onOpenChange, onSubmit, initialJob, today, title, description }: JobDialogProps) {
  const [isOtherPlatform, setIsOtherPlatform] = useState(false)
  const [customPlatform, setCustomPlatform] = useState("")
  
  const [job, setJob] = useState<JobFormData>({
    company: "",
    role: "",
    platform: "LinkedIn",
    status: "applied",
    appliedDate: today,
    socials: { linkedin: "", email: "", x: "" },
    notes: "",
    autoGhostDays: 14
  })

  // Sync state when dialog opens or initialJob changes
  useEffect(() => {
    if (!open) return

    requestAnimationFrame(() => {
      if (initialJob) {
        const isCustom = !PLATFORMS.includes(initialJob.platform)
        setJob({ 
          company: initialJob.company,
          role: initialJob.role,
          platform: initialJob.platform,
          status: initialJob.status,
          appliedDate: initialJob.appliedDate,
          socials: { 
            linkedin: initialJob.socials?.linkedin || "", 
            email: initialJob.socials?.email || "", 
            x: initialJob.socials?.x || "" 
          },
          notes: initialJob.notes || "",
          autoGhostDays: initialJob.autoGhostDays
        })
        setIsOtherPlatform(isCustom)
        setCustomPlatform(isCustom ? initialJob.platform : "")
      } else {
        setJob({
          company: "",
          role: "",
          platform: "LinkedIn",
          status: "applied",
          appliedDate: today,
          socials: { linkedin: "", email: "", x: "" },
          notes: "",
          autoGhostDays: 14
        })
        setIsOtherPlatform(false)
        setCustomPlatform("")
      }
    })
  }, [initialJob, today, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const finalJob = {
      ...job,
      platform: isOtherPlatform ? customPlatform : job.platform
    }
    onSubmit(finalJob)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {description}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 p-6 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="company" className="text-sm font-medium text-ink">Company</label>
              <input
                id="company"
                required
                value={job.company || ""}
                onChange={(e) => setJob({ ...job, company: e.target.value })}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                placeholder="e.g. Vercel"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium text-ink">Role</label>
              <input
                id="role"
                required
                value={job.role || ""}
                onChange={(e) => setJob({ ...job, role: e.target.value })}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                placeholder="e.g. Frontend Engineer"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="platform" className="text-sm font-medium text-ink">Platform</label>
            <div className="flex gap-2">
              <select
                id="platform"
                value={isOtherPlatform ? "Other" : job.platform}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === "Other") {
                    setIsOtherPlatform(true)
                  } else {
                    setIsOtherPlatform(false)
                    setJob({ ...job, platform: val })
                  }
                }}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              {isOtherPlatform && (
                <input
                  required
                  placeholder="Platform name"
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value)}
                  className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium text-ink">Status</label>
              <select
                id="status"
                value={job.status || "applied"}
                onChange={(e) => setJob({ ...job, status: e.target.value as JobStatus })}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
              >
                <option value="applied">Applied</option>
                <option value="ongoing">Ongoing</option>
                {initialJob && <option value="ghosted">Ghosted</option>}
                {initialJob && <option value="rejected">Rejected</option>}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium text-ink">Applied Date</label>
              <input
                id="date"
                type="date"
                required
                value={job.appliedDate || ""}
                onChange={(e) => setJob({ ...job, appliedDate: e.target.value })}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="autoGhost" className="text-sm font-medium text-ink">Auto Ghost After (days)</label>
            <input
              id="autoGhost"
              type="number"
              min="7"
              max="90"
              required
              value={job.autoGhostDays === undefined || isNaN(job.autoGhostDays) ? "" : job.autoGhostDays}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                setJob({ ...job, autoGhostDays: isNaN(val) ? 14 : val })
              }}
              className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
              placeholder="e.g. 14"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium text-ink">Notes</label>
            <textarea
              id="notes"
              value={job.notes || ""}
              onChange={(e) => setJob({ ...job, notes: e.target.value })}
              className="min-h-[80px] w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
              placeholder="Add important points..."
            />
          </div>
          <div className="grid gap-2 pt-2 border-t border-hairline">
            <p className="text-xs font-mono uppercase text-mute">Socials (Optional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              <input
                placeholder="LinkedIn URL"
                value={job.socials?.linkedin || ""}
                onChange={(e) => setJob({ ...job, socials: { ...job.socials, linkedin: e.target.value } })}
                className="h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink/20"
              />
              <input
                placeholder="Recruiter Email"
                value={job.socials?.email || ""}
                onChange={(e) => setJob({ ...job, socials: { ...job.socials, email: e.target.value } })}
                className="h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink/20"
              />
              <input
                placeholder="X (Twitter) URL"
                value={job.socials?.x || ""}
                onChange={(e) => setJob({ ...job, socials: { ...job.socials, x: e.target.value } })}
                className="h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink/20 sm:col-span-2"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">{initialJob ? "Save Changes" : "Add Application"}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
