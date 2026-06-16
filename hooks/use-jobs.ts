import { useState, useMemo, useEffect } from "react"
import { Job, JobStatus, Socials } from "@/types/job"
import { getJobsAction, addJobAction, updateJobAction, deleteJobAction } from "@/lib/actions/job-actions"

// Use the session date: June 13, 2026 (Today)
export const TODAY_STR = "2026-06-13"
export const TODAY = new Date(TODAY_STR + "T00:00:00") // Force UTC or local consistently

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    async function fetchJobs() {
      try {
        const fetchedJobs = await getJobsAction()
        setJobs(fetchedJobs)
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const getEffectiveStatus = (job: Job) => {
    if (job.status === "rejected") return "rejected"
    
    const appliedDate = new Date(job.appliedDate)
    const diffTime = TODAY.getTime() - appliedDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    const threshold = Math.max(7, job.autoGhostDays || 14)
    if (diffDays > threshold || job.status === "ghosted") return "ghosted"
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
  }, [jobs, search, statusFilter, sortOrder])

  const stats = useMemo(() => ({
    applied: jobs.length,
    ongoing: jobs.filter(j => getEffectiveStatus(j) === "ongoing").length,
    ghosted: jobs.filter(j => getEffectiveStatus(j) === "ghosted").length,
    rejected: jobs.filter(j => getEffectiveStatus(j) === "rejected").length,
  }), [jobs])

  const addJob = async (jobData: Omit<Job, "id">) => {
    try {
      const newJob = await addJobAction(jobData)
      const formattedJob: Job = {
        id: newJob.id,
        company: newJob.company,
        role: newJob.role,
        platform: newJob.platform,
        status: newJob.status as JobStatus,
        appliedDate: new Date(newJob.appliedDate).toISOString().split("T")[0],
        notes: newJob.notes || "",
        socials: (newJob.socials as Socials) || { linkedin: "", email: "", x: "" },
        autoGhostDays: newJob.autoGhostDays,
        interactionCount: newJob.interactionCount,
        lastInteractionAt: newJob.lastInteractionAt.toISOString(),
        contactEmail: newJob.contactEmail,
        processedMessageIds: newJob.processedMessageIds,
        threadId: newJob.threadId,
      }
      setJobs(prev => [formattedJob, ...prev])
    } catch (error) {
      console.error("Failed to add job:", error)
    }
  }

  const updateJob = async (jobData: Job) => {
    try {
      await updateJobAction(jobData.id, jobData)
      setJobs(prev => prev.map(j => j.id === jobData.id ? jobData : j))
    } catch (error) {
      console.error("Failed to update job:", error)
    }
  }

  const deleteJob = async (id: string) => {
    try {
      await deleteJobAction(id)
      setJobs(prev => prev.filter(job => job.id !== id))
    } catch (error) {
      console.error("Failed to delete job:", error)
    }
  }

  const toggleSort = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc")
  }

  return {
    jobs,
    loading,
    filteredJobs,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    stats,
    addJob,
    updateJob,
    deleteJob,
    toggleSort,
    getEffectiveStatus
  }
}
