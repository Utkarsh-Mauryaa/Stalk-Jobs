"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  Plus, 
  Search, 
  Filter, 
  Link2, 
  Mail, 
  Trash2,
  Pencil,
  Calendar,
  Building2,
  Clock,
  ChevronUp,
  ChevronDown,
  X,
  StickyNote
} from "lucide-react"

const INITIAL_JOBS = [
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
]

export default function Dashboard() {
  const [jobs, setJobs] = useState(INITIAL_JOBS)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [ghostDays, setGhostDays] = useState(14)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<typeof INITIAL_JOBS[0] | null>(null)

  // Use the session date: June 10, 2026
  const TODAY = new Date("2026-06-10")

  const [newJob, setNewJob] = useState({
    company: "",
    role: "",
    status: "applied" as const,
    appliedDate: TODAY.toISOString().split("T")[0],
    socials: { linkedin: "", email: "", x: "" },
    notes: ""
  })

  const getEffectiveStatus = (job: typeof INITIAL_JOBS[0]) => {
    if (job.status === "rejected") return "rejected"
    
    const appliedDate = new Date(job.appliedDate)
    const diffTime = TODAY.getTime() - appliedDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > ghostDays || job.status === "ghosted") return "ghosted"
    return job.status
  }

  const filteredJobs = jobs
    .filter(job => {
      const company = job.company || ""
      const role = job.role || ""
      const notes = job.notes || ""
      const matchesSearch = company.toLowerCase().includes(search.toLowerCase()) || 
                           role.toLowerCase().includes(search.toLowerCase()) ||
                           notes.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || getEffectiveStatus(job) === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const dateA = new Date(a.appliedDate).getTime()
      const dateB = new Date(b.appliedDate).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

  const stats = {
    applied: jobs.length,
    ongoing: jobs.filter(j => getEffectiveStatus(j) === "ongoing").length,
    ghosted: jobs.filter(j => getEffectiveStatus(j) === "ghosted").length,
    rejected: jobs.filter(j => getEffectiveStatus(j) === "rejected").length,
  }

  const deleteJob = (id: number) => {
    setJobs(jobs.filter(job => job.id !== id))
  }

  const toggleSort = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc")
  }

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newJob.company || !newJob.role) return
    
    const id = jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1
    // Add job with explicit socials even if empty to avoid runtime errors
    setJobs([{ ...newJob, id, socials: { ...newJob.socials } }, ...jobs])
    setIsDialogOpen(false)
    setNewJob({
      company: "",
      role: "",
      status: "applied",
      appliedDate: TODAY.toISOString().split("T")[0],
      socials: { linkedin: "", email: "", x: "" },
      notes: ""
    })
  }

  const handleUpdateJob = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingJob || !editingJob.company || !editingJob.role) return
    
    setJobs(jobs.map(j => j.id === editingJob.id ? editingJob : j))
    setIsEditOpen(false)
    setEditingJob(null)
  }

  const startEditing = (job: typeof INITIAL_JOBS[0]) => {
    setEditingJob({ ...job })
    setIsEditOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas-soft">
      <Navbar />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink">Applications</h1>
              <p className="text-sm text-body">Manage and track your job search progress.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-canvas border border-hairline rounded-md px-3 py-1 text-sm text-body">
                <Clock className="h-4 w-4 text-mute" />
                <span>Auto-Ghost after:</span>
                <input 
                  type="number" 
                  value={ghostDays}
                  onChange={(e) => setGhostDays(parseInt(e.target.value) || 0)}
                  className="w-12 bg-transparent border-none focus:ring-0 font-medium text-ink p-0"
                />
                <span className="text-mute">days</span>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4" /> Add Application
              </Button>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
              <DialogDescription>
                Enter the details of the job you&apos;ve applied for.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddJob}>
              <div className="grid gap-4 p-6 pt-0">
                <div className="grid gap-2">
                  <label htmlFor="company" className="text-sm font-medium text-ink">Company</label>
                  <input
                    id="company"
                    required
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                    placeholder="e.g. Vercel"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="role" className="text-sm font-medium text-ink">Role</label>
                  <input
                    id="role"
                    required
                    value={newJob.role}
                    onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                    className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                    placeholder="e.g. Frontend Engineer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="status" className="text-sm font-medium text-ink">Status</label>
                    <select
                      id="status"
                      value={newJob.status}
                      onChange={(e) => setNewJob({ ...newJob, status: e.target.value as any })}
                      className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                    >
                      <option value="applied">Applied</option>
                      <option value="ongoing">Ongoing</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="date" className="text-sm font-medium text-ink">Applied Date</label>
                    <input
                      id="date"
                      type="date"
                      required
                      value={newJob.appliedDate}
                      onChange={(e) => setNewJob({ ...newJob, appliedDate: e.target.value })}
                      className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="notes" className="text-sm font-medium text-ink">Notes</label>
                  <textarea
                    id="notes"
                    value={newJob.notes}
                    onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
                    className="min-h-[80px] w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                    placeholder="Add important points (e.g. interview dates, recruiter names)..."
                  />
                </div>
                <div className="grid gap-2 pt-2 border-t border-hairline">
                  <p className="text-xs font-mono uppercase text-mute">Socials (Optional)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                    <input
                      placeholder="LinkedIn URL"
                      value={newJob.socials.linkedin}
                      onChange={(e) => setNewJob({ ...newJob, socials: { ...newJob.socials, linkedin: e.target.value } })}
                      className="h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink/20"
                    />
                    <input
                      placeholder="Recruiter Email"
                      value={newJob.socials.email}
                      onChange={(e) => setNewJob({ ...newJob, socials: { ...newJob.socials, email: e.target.value } })}
                      className="h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink/20"
                    />
                    <input
                      placeholder="X (Twitter) URL"
                      value={newJob.socials.x}
                      onChange={(e) => setNewJob({ ...newJob, socials: { ...newJob.socials, x: e.target.value } })}
                      className="h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink/20 sm:col-span-2"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Application</Button>
              </DialogFooter>
            </form>
          </Dialog>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogHeader>
              <DialogTitle>Edit Application</DialogTitle>
              <DialogDescription>
                Update the details of your application.
              </DialogDescription>
            </DialogHeader>
            {editingJob && (
              <form onSubmit={handleUpdateJob}>
                <div className="grid gap-4 p-6 pt-0">
                  <div className="grid gap-2">
                    <label htmlFor="edit-company" className="text-sm font-medium text-ink">Company</label>
                    <input
                      id="edit-company"
                      required
                      value={editingJob.company}
                      onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                      className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="edit-role" className="text-sm font-medium text-ink">Role</label>
                    <input
                      id="edit-role"
                      required
                      value={editingJob.role}
                      onChange={(e) => setEditingJob({ ...editingJob, role: e.target.value })}
                      className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="edit-status" className="text-sm font-medium text-ink">Status</label>
                      <select
                        id="edit-status"
                        value={editingJob.status}
                        onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as any })}
                        className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                      >
                        <option value="applied">Applied</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="ghosted">Ghosted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="edit-date" className="text-sm font-medium text-ink">Applied Date</label>
                      <input
                        id="edit-date"
                        type="date"
                        required
                        value={editingJob.appliedDate}
                        onChange={(e) => setEditingJob({ ...editingJob, appliedDate: e.target.value })}
                        className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="edit-notes" className="text-sm font-medium text-ink">Notes</label>
                    <textarea
                      id="edit-notes"
                      value={editingJob.notes}
                      onChange={(e) => setEditingJob({ ...editingJob, notes: e.target.value })}
                      className="min-h-[80px] w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
                    />
                  </div>
                  <div className="grid gap-2 pt-2 border-t border-hairline">
                    <p className="text-xs font-mono uppercase text-mute">Socials (Optional)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                      <input
                        placeholder="LinkedIn URL"
                        value={editingJob.socials.linkedin}
                        onChange={(e) => setEditingJob({ ...editingJob, socials: { ...editingJob.socials, linkedin: e.target.value } })}
                        className="h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink/20"
                      />
                      <input
                        placeholder="Recruiter Email"
                        value={editingJob.socials.email}
                        onChange={(e) => setEditingJob({ ...editingJob, socials: { ...editingJob.socials, email: e.target.value } })}
                        className="h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink/20"
                      />
                      <input
                        placeholder="X (Twitter) URL"
                        value={editingJob.socials.x}
                        onChange={(e) => setEditingJob({ ...editingJob, socials: { ...editingJob.socials, x: e.target.value } })}
                        className="h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ink/20 sm:col-span-2"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            )}
          </Dialog>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Applied" value={stats.applied.toString()} />
            <StatCard label="Ongoing" value={stats.ongoing.toString()} />
            <StatCard label="Ghosted" value={stats.ghosted.toString()} />
            <StatCard label="Rejected" value={stats.rejected.toString()} />
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
              <input 
                type="text" 
                placeholder="Search by company or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-hairline bg-canvas text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={toggleSort} className="gap-2 min-w-[140px]">
                {sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                Sort: {sortOrder === "desc" ? "Newest" : "Oldest"}
              </Button>
              <div className="relative flex items-center">
                <Filter className="absolute left-3 h-4 w-4 text-mute pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 pl-10 pr-8 rounded-md border border-hairline bg-canvas text-sm focus:outline-none focus:ring-1 focus:ring-ink/20 appearance-none min-w-[140px] text-ink cursor-pointer hover:bg-canvas-soft transition-colors"
                >
                  <option value="all">All Statuses</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="applied">Applied</option>
                  <option value="ghosted">Ghosted</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 text-mute pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Job List */}
          <div className="rounded-xl border border-hairline bg-canvas shadow-level-1 overflow-hidden">
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
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-canvas-soft transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-ink flex items-center gap-2">
                              <Building2 className="h-3 w-3 text-mute" /> {job.company}
                            </span>
                            <span className="text-sm text-body">{job.role}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getEffectiveStatus(job) as "ongoing" | "applied" | "ghosted" | "rejected"}>
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
                            {job.socials.linkedin && (
                              <a href={job.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-mute hover:text-ink transition-colors p-1 hover:bg-canvas-soft-2 rounded">
                                <Link2 className="h-4 w-4" />
                              </a>
                            )}
                            {job.socials.email && (
                              <a href={`mailto:${job.socials.email}`} className="text-mute hover:text-ink transition-colors p-1 hover:bg-canvas-soft-2 rounded">
                                <Mail className="h-4 w-4" />
                              </a>
                            )}
                            {job.socials.x && (
                              <a href={job.socials.x} target="_blank" rel="noopener noreferrer" className="text-mute hover:text-ink transition-colors p-1 hover:bg-canvas-soft-2 rounded">
                                <X className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-mute hover:text-ink opacity-0 group-hover:opacity-100 transition-all" onClick={() => startEditing(job)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-mute hover:text-error opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteJob(job.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-mute italic">
                        No applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Automation Note */}
          <div className="mt-8 p-6 rounded-xl border border-hairline bg-link/5 border-link/10">
            <h3 className="text-sm font-semibold text-link mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Inbox Sync Active
            </h3>
            <p className="text-sm text-body leading-relaxed">
              We&apos;re monitoring <strong>utkarsh@example.com</strong> for new applications, rejections, and interview invites. 
              Statuses will update automatically as soon as emails arrive.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-4 rounded-xl border border-hairline bg-canvas shadow-level-1">
      <p className="text-xs font-mono uppercase text-mute mb-1">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </div>
  )
}
