"use client"

import { motion } from "framer-motion"
import { Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  ghostDays: number
  setGhostDays: (days: number) => void
  onAddClick: () => void
}

export function DashboardHeader({ ghostDays, setGhostDays, onAddClick }: DashboardHeaderProps) {
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
        <div className="flex items-center gap-2 bg-canvas border border-hairline rounded-md px-3 py-1 text-sm text-body">
          <Clock className="h-4 w-4 text-mute" />
          <span>Auto-Ghost after:</span>
          <input 
            type="number" 
            value={ghostDays ?? 0}
            onChange={(e) => setGhostDays(parseInt(e.target.value) || 0)}
            className="w-12 bg-transparent border-none focus:ring-0 font-medium text-ink p-0"
          />
          <span className="text-mute">days</span>
        </div>
        <Button size="sm" className="gap-2" onClick={onAddClick}>
          <Plus className="h-4 w-4" /> Add Application
        </Button>
      </motion.div>
    </div>
  )
}
