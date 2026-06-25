"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Building2, Calendar, StickyNote, Mail, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Job } from "@/types/job"
import { formatDate } from "@/lib/utils"
import { useState } from "react"
import { EmailListDialog } from "./email-list-dialog"

interface JobTableProps {
  jobs: Job[]
  getEffectiveStatus: (job: Job) => string
  onEdit: (job: Job) => void
  onDelete: (id: string) => void
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}

export function JobTable({ 
  jobs, 
  getEffectiveStatus, 
  onEdit, 
  onDelete,
  hasMore = false,
  loadingMore = false,
  onLoadMore
}: JobTableProps) {
  const [emailListJob, setEmailListJob] = useState<Job | null>(null)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || loadingMore || !hasMore) return
    const target = e.currentTarget
    const threshold = 50 // px from bottom
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= threshold
    if (isNearBottom) {
      onLoadMore()
    }
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-hairline bg-canvas shadow-level-1 overflow-hidden mb-6"
      >
        <div 
          className="overflow-auto max-h-[500px]"
          onScroll={handleScroll}
        >
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-hairline bg-canvas-soft-2 text-mute">
                <th className="sticky top-0 z-10 bg-canvas-soft-2 px-6 py-3 text-xs font-mono uppercase tracking-wider">Company & Role</th>
                <th className="sticky top-0 z-10 bg-canvas-soft-2 px-6 py-3 text-xs font-mono uppercase tracking-wider">Platform</th>
                <th className="sticky top-0 z-10 bg-canvas-soft-2 px-6 py-3 text-xs font-mono uppercase tracking-wider">Status</th>
                <th className="sticky top-0 z-10 bg-canvas-soft-2 px-6 py-3 text-xs font-mono uppercase tracking-wider">Interactions</th>
                <th className="sticky top-0 z-10 bg-canvas-soft-2 px-6 py-3 text-xs font-mono uppercase tracking-wider">Applied On</th>
                <th className="sticky top-0 z-10 bg-canvas-soft-2 px-6 py-3 text-xs font-mono uppercase tracking-wider">Notes</th>
                <th className="sticky top-0 z-10 bg-canvas-soft-2 px-6 py-3 text-xs font-mono uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              <AnimatePresence>
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <motion.tr 
                      layout
                      key={job.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-canvas-soft transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-ink flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-mute" /> {job.company}
                          </span>
                          <span className="text-sm text-body">{job.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-body">{job.platform}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getEffectiveStatus(job) as "applied" | "ongoing" | "ghosted" | "rejected" | "default"}>
                          {getEffectiveStatus(job).charAt(0).toUpperCase() + getEffectiveStatus(job).slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => setEmailListJob(job)}
                            className="flex items-center gap-2 hover:bg-canvas-soft-2 p-1 -m-1 rounded transition-colors text-left group/mail"
                          >
                            <span className="text-sm text-ink font-medium underline underline-offset-4 decoration-hairline hover:decoration-ink transition-colors">
                              {job.interactionCount || 1} emails
                            </span>
                            <Mail className="h-3 w-3 text-mute group-hover/mail:text-ink transition-colors" />
                          </button>
                          <span className="text-xs text-mute">Last: {formatDate(job.lastInteractionAt)}</span>
                        </div>
                      </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-body">
                        <Calendar className="h-3 w-3 text-mute" /> {formatDate(job.appliedDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px] text-sm text-body truncate group-hover:whitespace-normal transition-all" title={job.notes}>
                        {job.notes ? (
                          <span className="flex items-start gap-2">
                            <StickyNote className="h-3 w-3 mt-1 text-mute flex-shrink-0" />
                            {job.notes}
                          </span>
                        ) : (
                          <span className="text-mute italic">No notes</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit(job)}
                          title="Edit Application"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this application?")) {
                              onDelete(job.id)
                            }
                          }}
                          title="Delete Application"
                          className="text-error hover:text-error hover:bg-error/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="empty"
                >
                  <td colSpan={7} className="px-6 py-12 text-center text-mute italic">
                    No applications found.
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
            {loadingMore && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-mute">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-mute border-t-ink" />
                    <span>Loading more applications...</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>

    <EmailListDialog 
      open={!!emailListJob} 
      onOpenChange={(open) => !open && setEmailListJob(null)} 
      job={emailListJob} 
    />
  </>
)
}
