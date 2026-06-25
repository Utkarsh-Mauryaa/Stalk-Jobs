import { useState, useEffect } from "react"
import { Job, JobStatus } from "@/types/job"
import { getJobsAction, addJobAction, updateJobAction, deleteJobAction, deleteAllJobsAction } from "@/lib/actions/job-actions"

// Use the current local date dynamically
export const TODAY_STR = new Date().toISOString().split("T")[0]
export const TODAY = new Date()

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [stats, setStats] = useState({
    applied: 0,
    ongoing: 0,
    ghosted: 0,
    rejected: 0,
  })

  // Debounce search state
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  const fetchJobs = async (pageToFetch = 1, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await getJobsAction({
        page: pageToFetch,
        limit: 15,
        search: debouncedSearch,
        statusFilter: statusFilter,
        sortOrder: sortOrder,
      })

      if (isInitial) {
        setJobs(response.jobs)
        setPage(1)
      } else {
        setJobs(prev => {
          const prevIds = new Set(prev.map(j => j.id))
          const newJobs = response.jobs.filter(j => !prevIds.has(j.id))
          return [...prev, ...newJobs]
        })
        setPage(pageToFetch)
      }

      setHasMore(response.hasMore)
      setStats(response.stats)
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Refetch when filters or debounced search changes
  useEffect(() => {
    fetchJobs(1, true)
  }, [debouncedSearch, statusFilter, sortOrder])

  const getEffectiveStatus = (job: Job) => {
    if (job.status === "rejected") return "rejected"
    
    const appliedDate = new Date(job.appliedDate)
    const diffTime = TODAY.getTime() - appliedDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    const threshold = Math.max(7, job.autoGhostDays || 14)
    if (diffDays > threshold || job.status === "ghosted") return "ghosted"
    return job.status
  }

  const loadMore = () => {
    if (loading || loadingMore || !hasMore) return
    fetchJobs(page + 1, false)
  }

  const addJob = async (jobData: Omit<Job, "id">) => {
    try {
      await addJobAction(jobData)
      await fetchJobs(1, true)
    } catch (error) {
      console.error("Failed to add job:", error)
    }
  }

  const updateJob = async (jobData: Job) => {
    try {
      await updateJobAction(jobData.id, jobData)
      await fetchJobs(1, true)
    } catch (error) {
      console.error("Failed to update job:", error)
    }
  }

  const deleteJob = async (id: string) => {
    try {
      await deleteJobAction(id)
      await fetchJobs(1, true)
    } catch (error) {
      console.error("Failed to delete job:", error)
    }
  }

  const deleteAllJobs = async () => {
    try {
      await deleteAllJobsAction()
      setJobs([])
      setStats({ applied: 0, ongoing: 0, ghosted: 0, rejected: 0 })
      setHasMore(false)
      setPage(1)
    } catch (error) {
      console.error("Failed to delete all jobs:", error)
    }
  }

  const toggleSort = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc")
  }

  return {
    jobs,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    filteredJobs: jobs,
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
    deleteAllJobs,
    toggleSort,
    getEffectiveStatus,
    refreshJobs: () => fetchJobs(1, true),
  }
}
