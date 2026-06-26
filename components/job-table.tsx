"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Building2, Calendar, StickyNote, Mail, Pencil, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Job } from "@/types/job"
import { formatDate } from "@/lib/utils"
import { useState } from "react"
import { EmailListDialog } from "./email-list-dialog"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface JobTableProps {
  jobs: Job[]
  getEffectiveStatus: (job: Job) => string
  onEdit: (job: Job) => void
  onDelete: (id: string) => void
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  loading?: boolean
}

export function JobTable({ 
  jobs, 
  getEffectiveStatus, 
  onEdit, 
  onDelete,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  loading = false
}: JobTableProps) {
  const [emailListJob, setEmailListJob] = useState<Job | null>(null)
  const [deleteConfirmJob, setDeleteConfirmJob] = useState<Job | null>(null)

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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-mute mb-3" />
              <p className="text-sm font-medium text-body">Please wait while we fetch your applications</p>
              <p className="text-xs text-mute mt-1">Loading applications...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <table className="hidden md:table w-full text-left">
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
                                onClick={() => setDeleteConfirmJob(job)}
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
                </tbody>
              </table>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-hairline bg-canvas">
                <AnimatePresence>
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <motion.div 
                        layout
                        key={`mobile-${job.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 flex flex-col gap-3 hover:bg-canvas-soft transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="font-semibold text-ink truncate flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-mute" /> {job.company}
                            </span>
                            <span className="text-sm text-body truncate">{job.role}</span>
                          </div>
                          <Badge variant={getEffectiveStatus(job) as "applied" | "ongoing" | "ghosted" | "rejected" | "default"}>
                            {getEffectiveStatus(job).charAt(0).toUpperCase() + getEffectiveStatus(job).slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-body py-1.5 border-y border-hairline/50">
                          <div>
                            <span className="text-mute block text-[10px] uppercase font-mono tracking-wider">Platform</span>
                            <span className="font-medium">{job.platform}</span>
                          </div>
                          <div>
                            <span className="text-mute block text-[10px] uppercase font-mono tracking-wider">Applied On</span>
                            <span className="flex items-center gap-1 font-medium">
                              <Calendar className="h-3 w-3 text-mute" /> {formatDate(job.appliedDate)}
                            </span>
                          </div>
                        </div>

                        {job.notes && (
                          <p className="text-xs text-body bg-canvas-soft-2/50 p-2 rounded border border-hairline/30 flex items-start gap-1.5">
                            <StickyNote className="h-3.5 w-3.5 mt-0.5 text-mute flex-shrink-0" />
                            <span className="line-clamp-2">{job.notes}</span>
                          </p>
                        )}

                        <div className="flex justify-between items-center gap-2 mt-1">
                          <div className="flex flex-col gap-0.5">
                            <button 
                              onClick={() => setEmailListJob(job)}
                              className="flex items-center gap-1.5 hover:bg-canvas-soft-2 p-1 -m-1 rounded transition-colors text-left"
                            >
                              <span className="text-xs font-semibold text-ink underline underline-offset-4 decoration-hairline">
                                {job.interactionCount || 1} emails
                              </span>
                              <Mail className="h-3 w-3 text-mute" />
                            </button>
                            <span className="text-[10px] text-mute">Last: {formatDate(job.lastInteractionAt)}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onEdit(job)}
                              title="Edit Application"
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setDeleteConfirmJob(job)}
                              title="Delete Application"
                              className="h-8 w-8 text-error hover:text-error hover:bg-error/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-mute italic text-sm">
                      No applications found.
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {loadingMore && (
                <div className="p-4 text-center text-sm text-mute border-t border-hairline bg-canvas">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-mute border-t-ink" />
                    <span>Loading more applications...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      <EmailListDialog 
        open={!!emailListJob} 
        onOpenChange={(open) => !open && setEmailListJob(null)} 
        job={emailListJob} 
      />

      <Dialog open={!!deleteConfirmJob} onOpenChange={(open) => !open && setDeleteConfirmJob(null)}>
        <DialogHeader>
          <DialogTitle>Delete Application</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your application for <span className="font-semibold text-ink">{deleteConfirmJob?.role}</span> at <span className="font-semibold text-ink">{deleteConfirmJob?.company}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="secondary" onClick={() => setDeleteConfirmJob(null)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              if (deleteConfirmJob) {
                onDelete(deleteConfirmJob.id)
                setDeleteConfirmJob(null)
              }
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}
