"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  onAddClick: () => void
}

export function DashboardHeader({ onAddClick }: DashboardHeaderProps) {
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
        className="flex flex-wrap gap-3"
      >
        <Button size="sm" className="gap-2" onClick={onAddClick}>
          <Plus className="h-4 w-4" /> Add Application
        </Button>
      </motion.div>
    </div>
  )
}
