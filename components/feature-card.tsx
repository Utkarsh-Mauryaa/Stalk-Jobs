"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
}

export function FeatureCard({ icon, title, description, badge }: FeatureCardProps) {
  return (
    <motion.div 
      variants={item}
      whileHover={{ y: -8 }}
      className="p-10 rounded-[2rem] border border-hairline bg-canvas shadow-level-2 hover:shadow-level-4 transition-all duration-300 relative group"
    >
      <div className="h-14 w-14 rounded-2xl bg-canvas flex items-center justify-center border border-hairline mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      {badge && (
        <span className="absolute top-10 right-10 text-[10px] font-mono uppercase tracking-widest text-mute bg-canvas-soft px-2 py-0.5 rounded border border-hairline">
          {badge}
        </span>
      )}
      <h3 className="text-xl font-bold text-ink mb-4">{title}</h3>
      <p className="text-sm text-body leading-relaxed opacity-80">{description}</p>
      <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-link opacity-0 group-hover:opacity-100 transition-opacity">
        Learn more <ArrowRight className="h-3 w-3" />
      </div>
    </motion.div>
  )
}
