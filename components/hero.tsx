"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LogoMarquee } from "@/components/logo-marquee"
import { signIn, useSession } from "next-auth/react"

export function Hero() {
  const { data: session } = useSession()

  return (
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
            className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink mb-8"
          >
            Stalk your dream job.<br />
            <span className="text-mute">Zero manual effort.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-2xl text-base sm:text-lg text-body mb-10"
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
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 group">
                  Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                className="gap-2 group"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="w-full"
          >
            <LogoMarquee />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
