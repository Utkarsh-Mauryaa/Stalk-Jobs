"use client"

import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, AlertTriangle, ArrowRight } from "lucide-react"
import { signIn } from "next-auth/react"

interface EmailWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmailWarningDialog({ open, onOpenChange }: EmailWarningDialogProps) {
  const handleProceed = () => {
    onOpenChange(false)
    signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 border border-warning/20 text-warning shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle>Email & Privacy Notice</DialogTitle>
        </div>
        <DialogDescription className="text-body text-sm mt-2">
          StalkJobs automatically detects and tracks job applications, interviews, and status updates directly from your inbox.
        </DialogDescription>
      </DialogHeader>

      <div className="p-6 pt-0 space-y-4">
        <div className="border border-hairline rounded-lg bg-canvas-soft p-4 space-y-3">
          <div className="flex gap-3 items-start">
            <Mail className="h-5 w-5 text-link shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-ink">Our Recommendation</p>
              <p className="text-xs text-body leading-relaxed mt-1">
                If you feel hesitant or unsure about StalkJobs analyzing your mail, we suggest using a <strong>dedicated email address</strong> exclusively for your job applications.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-mute leading-relaxed">
          Using a dedicated email keeps your personal/primary inbox completely untouched and private, ensuring you remain 100% tension-free because it will only contain job-related mail.
        </p>
      </div>

      <DialogFooter className="p-6 pt-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button 
          variant="secondary" 
          onClick={() => onOpenChange(false)}
          className="text-xs rounded-sm"
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleProceed}
          className="gap-2 group text-xs rounded-sm bg-ink text-canvas hover:bg-ink/90"
        >
          Proceed to Sign In <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
