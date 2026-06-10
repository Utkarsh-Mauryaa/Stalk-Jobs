import { useState, useMemo } from "react"
import { Job, JobStatus } from "@/types/job"
import { INITIAL_JOBS } from "@/constants/jobs"

// Use the session date: June 10, 2026
export const TODAY = new Date("2026-06-10")

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [ghostDays, setGhostDays] = useState(14)

  const getEffectiveStatus = (job: Job) => {
    if (job.status === "rejected") return "rejected"
    
    const appliedDate = new Date(job.appliedDate)
    const diffTime = TODAY.getTime() - appliedDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > ghostDays || job.status === "ghosted") return "ghosted"
    return job.status
  }

  const filteredJobs = useMemo(() => {
    return jobs
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
  }, [jobs, search, statusFilter, sortOrder, ghostDays])

  const stats = useMemo(() => ({
    applied: jobs.length,
    ongoing: jobs.filter(j => getEffectiveStatus(j) === "ongoing").length,
    ghosted: jobs.filter(j => getEffectiveStatus(j) === "ghosted").length,
    rejected: jobs.filter(j => getEffectiveStatus(j) === "rejected").length,
  }), [jobs, ghostDays])

  const addJob = (job: Omit<Job, "id">) => {
    const id = jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1
    setJobs([{ ...job, id }, ...jobs])
  }

  const updateJob = (job: Job) => {
    setJobs(jobs.map(j => j.id === job.id ? job : j))
  }

  const deleteJob = (id: number) => {
    setJobs(jobs.filter(job => job.id !== id))
  }

  const toggleSort = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc")
  }

  return {
    jobs,
    filteredJobs,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    ghostDays,
    setGhostDays,
    stats,
    addJob,
    updateJob,
    deleteJob,
    toggleSort,
    getEffectiveStatus
  }
}
