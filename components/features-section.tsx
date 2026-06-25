"use client"

import { motion } from "framer-motion"
import { Mail, Zap, Search } from "lucide-react"
import { FeatureCard } from "./feature-card"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24 lg:py-32 bg-canvas relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[length:32px_32px] pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-link mb-4">Precision Tools</h2>
          <h3 className="text-4xl font-bold text-ink">Supercharge your search.</h3>
        </motion.div>
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          <FeatureCard 
            icon={<Mail className="h-6 w-6 text-link" />}
            title="Email Automation"
            description="Our proprietary engine scans your inbox in real-time. Application confirmations, rejections, and interview invites are mapped instantly."
            badge="Real-time"
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6 text-warning" />}
            title="Ghost Detection"
            description="Stop wasting mental energy. We flag unresponsive applications and generate perfectly-timed nudge emails to keep you top-of-mind."
            badge="Smart"
          />
          <FeatureCard 
            icon={<Search className="h-6 w-6 text-success" />}
            title="Smart CRM"
            description="We find the hiring manager behind the post. Get direct LinkedIn profiles, X handles, and verified emails in one click."
            badge="Verified"
          />
        </motion.div>
      </div>
    </section>
  )
}
