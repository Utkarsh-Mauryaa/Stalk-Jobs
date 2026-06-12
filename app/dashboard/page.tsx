"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import { useJobs, TODAY } from "@/hooks/use-jobs"
import { StatCard } from "@/components/stat-card"
import { JobTable } from "@/components/job-table"
import { JobDialog, JobFormData } from "@/components/job-dialog"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardFilters } from "@/components/dashboard-filters"
import { Job } from "@/types/job"

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
    toggleSort,
    getEffectiveStatus
  } = useJobs()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  const handleAddJob = (jobData: JobFormData) => {
    addJob(jobData)
    setIsAddOpen(false)
  }

  const handleUpdateJob = (formData: JobFormData) => {
    if (editingJob) {
      updateJob({ ...formData, id: editingJob.id } as Job)
    }
    setIsEditOpen(false)
    setEditingJob(null)
  }

  const startEditing = (job: Job) => {
    setEditingJob(job)
    setIsEditOpen(true)
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
          />

          <JobDialog 
            open={isAddOpen} 
            onOpenChange={setIsAddOpen} 
            onSubmit={handleAddJob}
            today={TODAY}
            title="Add New Application"
            description="Enter the details of the job you've applied for."
          />

          <JobDialog 
            open={isEditOpen} 
            onOpenChange={setIsEditOpen} 
            onSubmit={handleUpdateJob}
            initialJob={editingJob}
            today={TODAY}
            title="Edit Application"
            description="Update the details of your application."
          />

          {/* Stats */}
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard label="Applied" value={stats.applied.toString()} />
            <StatCard label="Ongoing" value={stats.ongoing.toString()} />
            <StatCard label="Ghosted" value={stats.ghosted.toString()} />
            <StatCard label="Rejected" value={stats.rejected.toString()} />
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
          />

          {/* Automation Note */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 p-6 rounded-xl border border-hairline bg-link/5 border-link/10"
          >
            <h3 className="text-sm font-semibold text-link mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Inbox Sync Active
            </h3>
            <p className="text-sm text-body leading-relaxed">
              We&apos;re monitoring <strong>utkarsh@example.com</strong> for new applications, rejections, and interview invites. 
              Statuses will update automatically as soon as emails arrive.
            </p>
          </motion.div>
        </div>
      </motion.main>
    </div>
  )
}
