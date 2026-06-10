"use client"

import { motion } from "framer-motion"

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

interface StatCardProps {
  label: string
  value: string
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <motion.div 
      variants={item}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="p-4 rounded-xl border border-hairline bg-canvas shadow-level-1"
    >
      <p className="text-xs font-mono uppercase text-mute mb-1">{label}</p>
      <p className="text-2xl font-bold text-ink">{value}</p>
    </motion.div>
  )
}
