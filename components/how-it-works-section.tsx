"use client"

import { motion } from "framer-motion"
import { Step } from "./step"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-canvas-soft border-y border-hairline">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-ink mb-4">How it works</h2>
          <p className="text-body max-w-xl mx-auto">Three steps to a cleaner job hunt.</p>
        </motion.div>
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          <Step 
            number="01"
            title="Connect"
            description="Connect a dedicated email address exclusively used for job applications for absolute peace of mind."
          />
          <Step 
            number="02"
            title="Apply"
            description="Go about your day. Apply on LinkedIn, Indeed, or company portals like you always do."
          />
          <Step 
            number="03"
            title="Track"
            description="Watch your dashboard populate in real-time. Statuses update as soon as the email hits your inbox."
          />
        </motion.div>
      </div>
    </section>
  )
}
