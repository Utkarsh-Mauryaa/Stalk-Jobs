"use client"

import { Mail, ExternalLink, Calendar } from "lucide-react"
import { 
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Job } from "@/types/job"
import { formatDate } from "@/lib/utils"

interface EmailListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: Job | null
}

export function EmailListDialog({ open, onOpenChange, job }: EmailListDialogProps) {
  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-mute" />
          Email Interactions
        </DialogTitle>
        <DialogDescription>
          Tracking {job.interactions?.length || 0} emails for {job.role} at {job.company}
        </DialogDescription>
      </DialogHeader>
      
      <div className="p-6 pt-0 max-h-[60vh] overflow-y-auto">
        <div className="space-y-3">
          {job.interactions && job.interactions.length > 0 ? (
            job.interactions.map((interaction) => (
              <div 
                key={interaction.id}
                className="flex items-center justify-between p-3 rounded-lg border border-hairline bg-canvas-soft hover:bg-canvas-soft-2 transition-colors group"
              >
                <div className="flex flex-col gap-1 min-w-0 pr-4">
                  <span className="text-sm font-medium text-ink truncate" title={interaction.subject}>
                    {interaction.subject}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-mute">
                    <Calendar className="h-3 w-3" />
                    {formatDate(interaction.date)}
                  </div>
                </div>
                <a 
                  href={`https://mail.google.com/mail/u/0/#all/${interaction.messageId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2 rounded-md bg-canvas border border-hairline text-mute hover:text-ink hover:border-ink/20 transition-all"
                  title="View in Gmail"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-mute italic">
              No detailed email history found. Only thread-level tracking is available for older entries.
              {job.threadId && (
                <div className="mt-4">
                  <a 
                    href={`https://mail.google.com/mail/u/0/#all/${job.threadId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-ink underline underline-offset-4 hover:text-mute transition-colors"
                  >
                    Open full Gmail thread
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}
