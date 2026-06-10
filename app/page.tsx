"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Mail, Zap, Shield, Search } from "lucide-react"
import { motion } from "framer-motion"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48 mesh-gradient">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10"
          >
            <div className="flex flex-col items-center text-center">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas-soft px-3 py-1 text-xs font-medium text-body mb-8"
              >
                <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                Now in Private Beta
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="max-w-4xl text-5xl font-bold tracking-tight text-ink sm:text-7xl mb-8"
              >
                Stalk your dream job.<br />
                <span className="text-mute">Zero manual effort.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="max-w-2xl text-lg text-body mb-10"
              >
                The first job application tracker that lives in your inbox. 
                Auto-detect applications, rejections, and interviews without lifting a finger.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 group">
                    Get Started for Free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-24 bg-canvas">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <FeatureCard 
                icon={<Mail className="h-5 w-5" />}
                title="Email Automation"
                description="Connect your email and let us do the work. We automatically detect every application event."
              />
              <FeatureCard 
                icon={<Zap className="h-5 w-5" />}
                title="Ghost Detection"
                description="Define your limit. If you don't hear back, we'll mark it as ghosted and suggest a nudge."
              />
              <FeatureCard 
                icon={<Search className="h-5 w-5" />}
                title="Smart CRM"
                description="We find the hiring manager's LinkedIn, X, and email so you can follow up with precision."
              />
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 bg-canvas-soft border-y border-hairline">
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
                description="Sign up with the email you use for job applications. No complex filters required."
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
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline py-12 bg-canvas">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-sm bg-ink" />
            <span className="text-sm font-semibold">Job Stalk</span>
          </div>
          <div className="text-sm text-mute">
            © 2026 Job Stalk. Built for the modern job hunter.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-body hover:text-ink">Privacy</Link>
            <Link href="#" className="text-sm text-body hover:text-ink">Terms</Link>
            <Link href="#" className="text-sm text-body hover:text-ink">X / Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      variants={item}
      whileHover={{ y: -5 }}
      className="p-8 rounded-xl border border-hairline bg-canvas shadow-level-2 hover:shadow-level-3 transition-shadow"
    >
      <div className="h-10 w-10 rounded-lg bg-canvas-soft flex items-center justify-center border border-hairline mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink mb-3">{title}</h3>
      <p className="text-sm text-body leading-relaxed">{description}</p>
    </motion.div>
  )
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <motion.div variants={item} className="flex flex-col">
      <div className="text-4xl font-mono text-hairline-strong mb-4">{number}</div>
      <h3 className="text-xl font-semibold text-ink mb-3">{title}</h3>
      <p className="text-body text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}
