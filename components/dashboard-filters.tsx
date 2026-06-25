"use client"

import { motion } from "framer-motion"
import { Search, ChevronDown, ChevronUp, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardFiltersProps {
  search: string
  setSearch: (search: string) => void
  sortOrder: "asc" | "desc"
  toggleSort: () => void
  statusFilter: string
  setStatusFilter: (status: string) => void
}

export function DashboardFilters({ 
  search, 
  setSearch, 
  sortOrder, 
  toggleSort, 
  statusFilter, 
  setStatusFilter 
}: DashboardFiltersProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col md:flex-row gap-4 mb-6"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
        <input 
          type="text" 
          placeholder="Search by company or role..."
          value={search || ""}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-md border border-hairline bg-canvas text-sm focus:outline-none focus:ring-1 focus:ring-ink/20"
        />
      </div>
      <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
        <Button variant="secondary" size="sm" onClick={toggleSort} className="gap-2 w-full sm:min-w-[140px] justify-center">
          {sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          Sort: {sortOrder === "desc" ? "Newest" : "Oldest"}
        </Button>
        <div className="relative flex items-center w-full sm:w-auto">
          <Filter className="absolute left-3 h-4 w-4 text-mute pointer-events-none" />
          <select
            value={statusFilter || "all"}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 pl-10 pr-8 rounded-md border border-hairline bg-canvas text-sm focus:outline-none focus:ring-1 focus:ring-ink/20 appearance-none w-full sm:min-w-[140px] text-ink cursor-pointer hover:bg-canvas-soft transition-colors"
          >
            <option value="all" className="text-ink bg-canvas">All Statuses</option>
            <option value="ongoing" className="text-warning bg-canvas">Ongoing</option>
            <option value="applied" className="text-link bg-canvas">Applied</option>
            <option value="ghosted" className="text-mute bg-canvas">Ghosted</option>
            <option value="rejected" className="text-error bg-canvas">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 h-4 w-4 text-mute pointer-events-none" />
        </div>
      </div>
    </motion.div>
  )
}
