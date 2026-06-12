"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ShieldCheck, ArrowRight, Loader2, RefreshCw, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export function EmailTrackingCard() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'syncing' | 'synced'>('idle')
  const [syncCount, setSyncCount] = useState(0)

  useEffect(() => {
    // Check if we are already connected on mount
    async function checkConnection() {
      try {
        const res = await fetch('/api/auth/check-gmail')
        const data = await res.json()
        if (data.connected) {
          setStatus('connected')
        }
      } catch (e) {
        console.error("Failed to check connection", e)
      }
    }
    checkConnection()
  }, [])

  const handleEnable = async () => {
    setStatus('loading')
    try {
      await signIn("google", 
        { callbackUrl: "/dashboard" }, 
        { 
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly", 
          prompt: "consent",
          access_type: "offline"
        }
      )
    } catch (error) {
      console.error("Sign in failed:", error)
      setStatus('idle')
    }
  }

  const handleSync = async () => {
    setStatus('syncing')
    try {
      const res = await fetch('/api/jobs/sync', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSyncCount(data.count)
        setStatus('synced')
        // Refresh the page to show new jobs after a short delay
        setTimeout(() => window.location.reload(), 2000)
      } else {
        setStatus('connected')
      }
    } catch (e) {
      console.error("Sync failed", e)
      setStatus('connected')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 overflow-hidden rounded-2xl border border-hairline bg-canvas shadow-sm"
    >
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            {status === 'idle' || status === 'loading' ? (
              <motion.div
                key="disabled"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-link/10">
                    <Mail className="h-5 w-5 text-link" />
                  </div>
                  <h3 className="text-lg font-semibold text-ink">Auto-Detection</h3>
                </div>
                
                <p className="text-body leading-relaxed mb-6 max-w-lg">
                  Stop manual entry. Connect your inbox and we&apos;ll automatically detect application confirmations, 
                  interview invites, and status updates.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                  <div className="flex items-center gap-1.5 text-xs text-mute">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Sensitive data only
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-hairline" />
                  <div className="flex items-center gap-1.5 text-xs text-mute">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Revoke access anytime
                  </div>
                </div>

                <Button 
                  onClick={handleEnable} 
                  disabled={status === 'loading'}
                  className="bg-ink text-canvas hover:bg-ink/90 px-6"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Enable Email Tracking
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="enabled"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-4 text-center"
              >
                <div className="mb-4 p-3 rounded-full bg-success/10 border border-success/20">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">
                  {status === 'connected' ? 'Email Tracking Active' : 
                   status === 'syncing' ? 'Syncing Inbox...' : 
                   `Found ${syncCount} New Applications!`}
                </h3>
                <p className="text-body max-w-md mb-6">
                  {status === 'connected' ? "We're ready to scan your inbox for job updates." : 
                   status === 'syncing' ? "This may take a few seconds while we parse your emails." :
                   "Your dashboard is being updated with the latest entries."}
                </p>
                
                {status === 'connected' && (
                  <Button onClick={handleSync} variant="outline" className="border-hairline hover:bg-canvas-soft">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </Button>
                )}
                
                {status === 'syncing' && (
                  <div className="flex items-center gap-2 text-mute text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking for updates...
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full md:w-72 bg-canvas-soft border-t md:border-t-0 md:border-l border-hairline p-8 flex flex-col justify-center">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-mute">Supported Platforms</h4>
            <div className="grid grid-cols-2 gap-3">
              {['LinkedIn', 'Indeed', 'Greenhouse', 'Lever', 'Workday', 'Ashby'].map((platform) => (
                <div key={platform} className="text-[11px] font-medium text-body px-2 py-1 rounded bg-canvas border border-hairline text-center">
                  {platform}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
