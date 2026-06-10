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
  Globe,
  Trash2,
  Calendar,
  Building2,
  Clock
} from "lucide-react"

const JOBS = [
  {
    id: 1,
    company: "Vercel",
    role: "Senior Frontend Engineer",
    status: "ongoing",
    appliedDate: "2026-06-05",
    socials: { linkedin: "#", email: "hiring@vercel.com", twitter: "#" }
  },
  {
    id: 2,
    company: "Linear",
    role: "Product Designer",
    status: "applied",
    appliedDate: "2026-06-01",
    socials: { linkedin: "#", email: "jobs@linear.app" }
  },
  {
    id: 3,
    company: "Stripe",
    role: "Fullstack Engineer",
    status: "ghosted",
    appliedDate: "2026-05-15",
    socials: { linkedin: "#" }
  },
  {
    id: 4,
    company: "OpenAI",
    role: "AI Research Engineer",
    status: "rejected",
    appliedDate: "2026-05-10",
    socials: { linkedin: "#", twitter: "#" }
  }
]

export default function Dashboard() {
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
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Clock className="h-4 w-4" /> Auto-Ghost: 14 days
              </Button>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Application
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Applications" value="24" />
            <StatCard label="Ongoing" value="8" />
            <StatCard label="Ghosted" value="5" />
            <StatCard label="Success Rate" value="12%" />
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
              <input 
                type="text" 
                placeholder="Search by company or role..."
                className="w-full h-10 pl-10 pr-4 rounded-md border border-hairline bg-canvas text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button variant="secondary" size="sm">
                Sort: Newest
              </Button>
            </div>
          </div>

          {/* Job List */}
          <div className="rounded-xl border border-hairline bg-canvas shadow-level-1 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-hairline bg-canvas-soft-2">
                  <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-mute">Company & Role</th>
                  <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-mute">Status</th>
                  <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-mute">Applied On</th>
                  <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-mute">Contact</th>
                  <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-mute text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {JOBS.map((job) => (
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
                      <Badge variant={job.status as any}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
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
                          <a href={job.socials.linkedin} className="text-mute hover:text-ink transition-colors">
                            <Link2 className="h-4 w-4" />
                          </a>
                        )}
                        {job.socials.email && (
                          <a href={`mailto:${job.socials.email}`} className="text-mute hover:text-ink transition-colors">
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        {job.socials.twitter && (
                          <a href={job.socials.twitter} className="text-mute hover:text-ink transition-colors">
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-mute hover:text-error opacity-0 group-hover:opacity-100 transition-all p-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
