"use client"

import { motion } from "framer-motion"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  onAddClick: () => void
  onDeleteAllClick: () => void
  hasJobs: boolean
}

export function DashboardHeader({ onAddClick, onDeleteAllClick, hasJobs }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-ink">Applications</h1>
        <p className="text-sm text-body">Manage and track your job search progress.</p>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-wrap items-center gap-3"
      >
        {hasJobs && (
          <Button 
            variant="outline" 
            className="gap-2 text-error border-error/30 hover:bg-error/5 hover:border-error/50" 
            onClick={onDeleteAllClick}
          >
            <Trash2 className="h-4 w-4" /> Delete All
          </Button>
        )}
        <Button className="gap-2 animate-none" onClick={onAddClick}>
          <Plus className="h-4 w-4" /> Add Application
        </Button>
      </motion.div>
    </div>
  )
}
