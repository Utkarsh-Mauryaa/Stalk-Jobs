"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { useJobs, TODAY_STR } from "@/hooks/use-jobs"
import { StatCard } from "@/components/stat-card"
import { JobTable } from "@/components/job-table"
import { JobDialog, JobFormData } from "@/components/job-dialog"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFilters } from "@/components/dashboard-filters"
import { EmailTrackingCard } from "@/components/email-tracking-card"
import { Job } from "@/types/job"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

export default function Dashboard() {
  const {
    jobs,
    filteredJobs,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortOrder,
    stats,
    addJob,
    updateJob,
    deleteJob,
    deleteAllJobs,
    toggleSort,
    getEffectiveStatus,
    refreshJobs,
    hasMore,
    loadingMore,
    loadMore
  } = useJobs()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  const handleAddJob = (jobData: JobFormData) => {
    addJob({
      ...jobData,
      interactionCount: 1,
      lastInteractionAt: new Date().toISOString(),
      processedMessageIds: [],
    })
    setIsAddOpen(false)
  }

  const handleUpdateJob = (formData: JobFormData) => {
    if (editingJob) {
      updateJob({ 
        ...editingJob,
        ...formData, 
      })
    }
    setIsEditOpen(false)
    setEditingJob(null)
  }

  const startEditing = (job: Job) => {
    setEditingJob(job)
    setIsEditOpen(true)
  }

  const handleDeleteAll = async () => {
    await deleteAllJobs()
    setIsDeleteAllOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas-soft">
      <Navbar />
      
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 p-4 sm:p-6 lg:p-8"
      >
        <div className="mx-auto max-w-7xl">
          <DashboardHeader 
            onAddClick={() => setIsAddOpen(true)} 
            onDeleteAllClick={() => setIsDeleteAllOpen(true)}
            hasJobs={jobs.length > 0}
          />

          <JobDialog 
            open={isAddOpen} 
            onOpenChange={setIsAddOpen} 
            onSubmit={handleAddJob}
            today={TODAY_STR}
            title="Add New Application"
            description="Enter the details of the job you've applied for."
          />

          <JobDialog 
            open={isEditOpen} 
            onOpenChange={setIsEditOpen} 
            onSubmit={handleUpdateJob}
            initialJob={editingJob}
            today={TODAY_STR}
            title="Edit Application"
            description="Update the details of your application."
          />

          <Dialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
            <DialogHeader>
              <DialogTitle>Delete All Applications</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete all job applications? This action cannot be undone. All your application data, history, and email sync mappings will be permanently cleared.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDeleteAllOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAll}>
                Delete All
              </Button>
            </DialogFooter>
          </Dialog>

          {/* Stats */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard label="Applied" value={stats.applied.toString()} variant="applied" />
            <StatCard label="Ongoing" value={stats.ongoing.toString()} variant="ongoing" />
            <StatCard label="Ghosted" value={stats.ghosted.toString()} variant="ghosted" />
            <StatCard label="Rejected" value={stats.rejected.toString()} variant="rejected" />
          </motion.div>

          <DashboardFilters 
            search={search}
            setSearch={setSearch}
            sortOrder={sortOrder}
            toggleSort={toggleSort}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          <JobTable 
            jobs={filteredJobs}
            getEffectiveStatus={getEffectiveStatus}
            onEdit={startEditing}
            onDelete={deleteJob}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
          />

          <EmailTrackingCard onRefresh={refreshJobs} />
        </div>
      </motion.main>
    </div>
  )
}
