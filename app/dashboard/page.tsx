"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Link2, 
  Mail, 
  Trash2,
  Calendar,
  Building2,
  Clock,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  X
} from "lucide-react"

const INITIAL_JOBS = [
  {
    id: 1,
    company: "Vercel",
    role: "Senior Frontend Engineer",
    status: "ongoing",
    appliedDate: "2026-06-05",
    socials: { linkedin: "https://linkedin.com", email: "hiring@vercel.com", x: "https://x.com" }
  },
  {
    id: 2,
    company: "Linear",
    role: "Product Designer",
    status: "applied",
    appliedDate: "2026-06-01",
    socials: { linkedin: "https://linkedin.com", email: "jobs@linear.app" }
  },
  {
    id: 3,
    company: "Stripe",
    role: "Fullstack Engineer",
    status: "ghosted",
    appliedDate: "2026-05-15",
    socials: { linkedin: "https://linkedin.com", x: "https://x.com" }
  },
  {
    id: 4,
    company: "OpenAI",
    role: "AI Research Engineer",
    status: "rejected",
    appliedDate: "2026-05-10",
    socials: { linkedin: "https://linkedin.com", x: "https://x.com" }
  },
  {
    id: 5,
    company: "GitHub",
    role: "Software Engineer",
    status: "ongoing",
    appliedDate: "2026-06-08",
    socials: { linkedin: "https://linkedin.com", email: "recruiting@github.com" }
  }
]

export default function Dashboard() {
  const [jobs, setJobs] = useState(INITIAL_JOBS)
  const [search, setSearch] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [ghostDays, setGhostDays] = useState(14)

  // Use the session date: June 10, 2026
  const TODAY = new Date("2026-06-10")

  const getEffectiveStatus = (job: typeof INITIAL_JOBS[0]) => {
    if (job.status === "rejected") return "rejected"
    
    const appliedDate = new Date(job.appliedDate)
    const diffTime = TODAY.getTime() - appliedDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > ghostDays || job.status === "ghosted") return "ghosted"
    return job.status
  }

  const filteredJobs = jobs
    .filter(job => 
      job.company.toLowerCase().includes(search.toLowerCase()) || 
      job.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.appliedDate).getTime()
      const dateB = new Date(b.appliedDate).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

  const stats = {
    applied: jobs.length,
    ongoing: jobs.filter(j => getEffectiveStatus(j) === "ongoing").length,
    ghosted: jobs.filter(j => getEffectiveStatus(j) === "ghosted").length,
    successRate: jobs.length > 0 
      ? Math.round((jobs.filter(j => getEffectiveStatus(j) === "ongoing").length / jobs.length) * 100)
      : 0
  }

  const deleteJob = (id: number) => {
    setJobs(jobs.filter(job => job.id !== id))
  }

  const toggleSort = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc")
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
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Application
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Applied" value={stats.applied.toString()} />
            <StatCard label="Ongoing" value={stats.ongoing.toString()} />
            <StatCard label="Ghosted" value={stats.ghosted.toString()} />
            <StatCard label="Success Rate" value={`${stats.successRate}%`} />
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
              <Button variant="secondary" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
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
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-mute hover:text-error opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteJob(job.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-mute italic">
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
              We're monitoring <strong>utkarsh@example.com</strong> for new applications, rejections, and interview invites. 
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
