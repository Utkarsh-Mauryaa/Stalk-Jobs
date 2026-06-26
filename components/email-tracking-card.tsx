"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ShieldCheck, ArrowRight, Loader2, RefreshCw, CheckCircle2, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog"

interface EmailTrackingCardProps {
  onRefresh?: () => void
}

export function EmailTrackingCard({ onRefresh }: EmailTrackingCardProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'syncing' | 'synced' | 'error'>('idle')
  const [syncCount, setSyncCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false)
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0)
  const [initialRetryAfter, setInitialRetryAfter] = useState(60)
  const [provider, setProvider] = useState<string>("Minimax")

  useEffect(() => {
    if (!isLimitDialogOpen || retryAfterSeconds <= 0) return

    const timer = setInterval(() => {
      setRetryAfterSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isLimitDialogOpen, retryAfterSeconds])

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`
  }

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
    setSyncCount(0)
    setErrorMessage("")
    try {
      const getCookie = (name: string) => {
        if (typeof document === 'undefined') return ''
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift() || ''
        return ''
      }
      const csrfToken = getCookie("csrf-token")
      const res = await fetch('/api/jobs/sync', { 
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken,
        }
      })
      
      const data = await res.json().catch(() => null)

      if (res.status === 429 || (data && data.rateLimit)) {
        const retryAfter = data?.retryAfter || 60
        const providerName = data?.provider || "Minimax"
        setProvider(providerName)
        setInitialRetryAfter(retryAfter)
        setRetryAfterSeconds(retryAfter)
        setIsLimitDialogOpen(true)
        setStatus('connected')
        return
      }

      if (!res.ok) {
        throw new Error(data?.error || `Server responded with ${res.status}`)
      }
      
      if (data && data.success) {
        setSyncCount(data.count)
        setStatus('synced')
        
        // Refresh the dashboard data immediately if new jobs found
        if (data.count > 0 && onRefresh) {
          onRefresh()
        }
        
        // Return to connected state after a short delay
        setTimeout(() => setStatus('connected'), 3000)
      } else {
        console.error("Sync error:", data?.error)
        setErrorMessage(data?.error || "Unknown synchronization error")
        setStatus('error')
        setTimeout(() => setStatus('connected'), 5000)
      }
    } catch (e: unknown) {
      console.error("Sync failed", e)
      const msg = e instanceof Error ? e.message : "Failed to reach the server. Please check your connection."
      setErrorMessage(msg)
      setStatus('error')
      setTimeout(() => setStatus('connected'), 5000)
    }
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-24 overflow-hidden rounded-2xl border border-hairline bg-canvas shadow-sm"
      >
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-6 sm:p-8">
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
                     status === 'error' ? 'Synchronization Failed' :
                     syncCount > 0 ? `Found ${syncCount} New Applications!` : "Inbox is Up to Date!"}
                  </h3>
                  <p className="text-body max-w-md mb-6">
                    {status === 'connected' ? "We're ready to scan your inbox for job updates." : 
                     status === 'syncing' ? "This may take a few seconds while we parse your emails." :
                     status === 'error' ? errorMessage :
                     syncCount > 0 ? "Your dashboard is being updated with the latest entries." :
                     "We couldn't find any new job-related emails since the last sync."}
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

          <div className="w-full md:w-72 bg-canvas-soft border-t md:border-t-0 md:border-l border-hairline p-6 sm:p-8 flex flex-col justify-center">
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

      <Dialog open={isLimitDialogOpen} onOpenChange={setIsLimitDialogOpen}>
        <DialogHeader className="pb-2">
          <div className="mx-auto sm:mx-0 mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 border border-warning/20 text-warning">
            <Timer className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl">{provider} AI Rate Limit Reached</DialogTitle>
          <DialogDescription className="text-sm">
            We process email tracking sync requests using {provider} AI. To ensure fair usage, our AI partner limits the frequency of requests.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-0 flex flex-col items-center justify-center space-y-4">
          <div className="w-full rounded-lg border border-hairline bg-canvas-soft p-5 text-center">
            <p className="text-xs text-mute uppercase tracking-wider mb-1 font-semibold">Time Remaining</p>
            <p className="text-2xl font-bold font-mono text-ink tracking-tight">
              {formatTime(retryAfterSeconds)}
            </p>
            
            {/* Visual Progress Bar */}
            {initialRetryAfter > 0 && (
              <div className="mt-3 w-full bg-hairline rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-warning h-1.5 transition-all duration-1000 ease-linear"
                  style={{ width: `${initialRetryAfter > 0 ? (retryAfterSeconds / initialRetryAfter) * 100 : 0}%` }}
                />
              </div>
            )}
          </div>
          <p className="text-xs text-mute text-center">
            You can keep using StalkJobs and view your existing job applications in the meantime.
          </p>
        </div>

        <DialogFooter className="border-t border-hairline/50 pt-4 bg-canvas-soft/40 px-6 pb-6">
          <Button
            variant="outline"
            onClick={() => setIsLimitDialogOpen(false)}
            className="border-hairline hover:bg-canvas-soft"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              setIsLimitDialogOpen(false)
              handleSync()
            }}
            disabled={retryAfterSeconds > 0}
            className={`${
              retryAfterSeconds > 0 
                ? "bg-mute text-canvas opacity-50 cursor-not-allowed" 
                : "bg-ink text-canvas hover:bg-ink/90"
            } px-6 transition-all`}
          >
            {retryAfterSeconds > 0 ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retry in {retryAfterSeconds}s
              </>
            ) : (
              "Retry Sync"
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  )
}
