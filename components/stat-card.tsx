"use client"

import { motion } from "framer-motion"

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

interface StatCardProps {
  label: string
  value: string
  variant?: "applied" | "ongoing" | "ghosted" | "rejected" | "default"
}

export function StatCard({ label, value, variant = "default" }: StatCardProps) {
  const variants = {
    default: {
      border: "border-hairline hover:border-hairline-strong",
      indicator: "bg-mute/40",
      accentLine: "bg-mute/30 group-hover:bg-mute/60",
      bgHover: "hover:bg-canvas-soft-2/50"
    },
    applied: {
      border: "border-hairline hover:border-link",
      indicator: "bg-link shadow-[0_0_8px_rgba(0,112,243,0.5)]",
      accentLine: "bg-link/50 group-hover:bg-link",
      bgHover: "hover:bg-link/[0.08]"
    },
    ongoing: {
      border: "border-hairline hover:border-warning",
      indicator: "bg-warning shadow-[0_0_8px_rgba(250,204,21,0.5)]",
      accentLine: "bg-warning/50 group-hover:bg-warning",
      bgHover: "hover:bg-warning/[0.08]"
    },
    ghosted: {
      border: "border-hairline hover:border-mute",
      indicator: "bg-mute shadow-[0_0_8px_rgba(136,136,136,0.3)]",
      accentLine: "bg-mute/30 group-hover:bg-mute/60",
      bgHover: "hover:bg-canvas-soft-2/80"
    },
    rejected: {
      border: "border-hairline hover:border-error",
      indicator: "bg-error shadow-[0_0_8px_rgba(238,0,0,0.5)]",
      accentLine: "bg-error/50 group-hover:bg-error",
      bgHover: "hover:bg-error/[0.08]"
    }
  }

  const style = variants[variant] || variants.default;

  return (
    <motion.div 
      variants={item}
      whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.2 } }}
      className={`p-5 rounded-xl border bg-canvas shadow-level-2 transition-all relative overflow-hidden group ${style.border} ${style.bgHover}`}
    >
      {/* Sleek top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 group-hover:h-1 transition-all ${style.accentLine}`} />
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-mono uppercase tracking-wider text-mute">{label}</p>
          <p className="text-3xl font-bold font-sans tracking-tight text-ink">{value}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-canvas-soft px-2 py-1 rounded-full border border-hairline transition-colors">
          <div className={`h-2 w-2 rounded-full ${style.indicator}`} />
          <span className="text-[10px] font-mono text-body font-medium uppercase">{variant}</span>
        </div>
      </div>
    </motion.div>
  )
}


