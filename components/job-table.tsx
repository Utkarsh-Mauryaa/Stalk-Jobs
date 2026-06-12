"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Building2, Calendar, StickyNote, Link2, Mail, X, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Job } from "@/types/job"

interface JobTableProps {
  jobs: Job[]
  getEffectiveStatus: (job: Job) => string
  onEdit: (job: Job) => void
  onDelete: (id: string) => void
}

export function JobTable({ jobs, getEffectiveStatus, onEdit, onDelete }: JobTableProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-hairline bg-canvas shadow-level-1 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-hairline bg-canvas-soft-2 text-mute">
              <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider">Company & Role</th>
              <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider">Applied On</th>
              <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider">Socials</th>
              <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            <AnimatePresence mode="popLayout">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <motion.tr 
                    layout
                    key={job.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
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
                      <Badge variant={getEffectiveStatus(job) as any}>
                        {getEffectiveStatus(job).charAt(0).toUpperCase() + getEffectiveStatus(job).slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-body">
                        <Calendar className="h-3 w-3 text-mute" /> {job.appliedDate}
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
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {job.socials?.linkedin && (
                          <a href={job.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-mute hover:text-ink transition-colors p-1 hover:bg-canvas-soft-2 rounded">
                            <Link2 className="h-4 w-4" />
                          </a>
                        )}
                        {job.socials?.email && (
                          <a href={`mailto:${job.socials.email}`} className="text-mute hover:text-ink transition-colors p-1 hover:bg-canvas-soft-2 rounded">
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        {job.socials?.x && (
                          <a href={job.socials.x} target="_blank" rel="noopener noreferrer" className="text-mute hover:text-ink transition-colors p-1 hover:bg-canvas-soft-2 rounded">
                            <X className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-mute hover:text-ink md:opacity-0 group-hover:opacity-100 transition-all" onClick={() => onEdit(job)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-mute hover:text-error md:opacity-0 group-hover:opacity-100 transition-all" onClick={() => onDelete(job.id)}>
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
                  <td colSpan={6} className="px-6 py-12 text-center text-mute italic">
                    No applications found.
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
