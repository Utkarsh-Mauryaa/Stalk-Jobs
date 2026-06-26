"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Job, JobStatus } from "@/types/job"

export type JobFormData = {
  company: string;
  role: string;
  platform: string;
  status: JobStatus;
  appliedDate: string;
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="relative w-full">
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
                  className="h-10 w-full rounded-md border border-hairline bg-canvas pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20 appearance-none cursor-pointer"
                >
                  {PLATFORMS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mute pointer-events-none" />
              </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium text-ink">Status</label>
              <div className="relative w-full">
                <select
                  id="status"
                  value={job.status || "applied"}
                  onChange={(e) => setJob({ ...job, status: e.target.value as JobStatus })}
                  className="h-10 w-full rounded-md border border-hairline bg-canvas pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20 appearance-none cursor-pointer"
                >
                  <option value="applied" className="text-link bg-canvas">Applied</option>
                  <option value="ongoing" className="text-warning bg-canvas">Ongoing</option>
                  {initialJob && <option value="ghosted" className="text-mute bg-canvas">Ghosted</option>}
                  {initialJob && <option value="rejected" className="text-error bg-canvas">Rejected</option>}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mute pointer-events-none" />
              </div>
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
