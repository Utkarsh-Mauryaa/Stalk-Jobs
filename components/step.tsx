"use client"

import { motion } from "framer-motion"

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

interface StepProps {
  number: string
  title: string
  description: string
}

export function Step({ number, title, description }: StepProps) {
  return (
    <motion.div variants={item} className="flex flex-col">
      <div className="text-4xl font-mono text-hairline-strong mb-4">{number}</div>
      <h3 className="text-xl font-semibold text-ink mb-3">{title}</h3>
      <p className="text-body text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}
