"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

export function EmailTrackingCard() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleEnable = async () => {
    setIsLoading(true)
    // In a real scenario, this would trigger the OAuth flow with the specific scope
    // For now, we simulate the "Started" state as requested.
    // We will use the signIn function with the specific scope when ready.
    
    // simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsEnabled(true)
    setIsLoading(false)
    
    // This is where we would eventually call:
    // signIn("google", { scope: "https://www.googleapis.com/auth/gmail.readonly" })
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
            {!isEnabled ? (
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
                  disabled={isLoading}
                  className="bg-ink text-canvas hover:bg-ink/90 px-6"
                >
                  {isLoading ? (
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
                  <ShieldCheck className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">Email Tracking Started</h3>
                <p className="text-body max-w-md">
                  We&apos;re now monitoring your inbox for job-related updates. 
                  Sit back and watch your dashboard stay up to date.
                </p>
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
