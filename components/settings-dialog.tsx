"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { deleteUserAccountAction } from "@/lib/actions/user-actions"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { ShieldAlert, AlertTriangle, User, Mail, Trash2 } from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { data: session } = useSession()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirmInput, setShowConfirmInput] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleDeleteAccount = async () => {
    if (confirmText !== "delete my account") {
      setError("Please type the exact phrase to confirm.")
      return
    }

    try {
      setIsDeleting(true)
      setError(null)
      const res = await deleteUserAccountAction()
      if (res.success) {
        // Sign out user and redirect to landing page
        await signOut({ callbackUrl: "/" })
      } else {
        setError("Something went wrong. Please try again.")
        setIsDeleting(false)
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred."
      setError(errMsg)
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset states
    setShowConfirmInput(false)
    setConfirmText("")
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader>
        <DialogTitle>Account Settings</DialogTitle>
        <DialogDescription>
          Manage your account profile and credentials.
        </DialogDescription>
      </DialogHeader>

      <div className="p-6 pt-0 space-y-6">
        {/* Profile Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-ink">User Profile</h3>
          <div className="rounded-lg border border-hairline bg-canvas-soft p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hairline text-body overflow-hidden">
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt={session.user.name || "User Profile"} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{session?.user?.name || "Job Seeker"}</p>
                <div className="flex items-center gap-1.5 text-xs text-mute mt-0.5">
                  <Mail className="h-3 w-3" />
                  <span>{session?.user?.email || "No email connected"}</span>
                </div>
              </div>
            </div>
            <div className="h-[1px] bg-hairline" />
            <div className="flex items-center justify-between text-xs text-mute">
              <span>Authentication provider</span>
              <span className="font-mono text-ink">Google OAuth</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-error flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" /> Danger Zone
          </h3>
          <div className="rounded-lg border border-error/20 bg-error/[0.02] p-4 space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-ink">Delete Account</h4>
              <p className="text-xs text-body leading-relaxed">
                Permanently delete your account, synced applications, and search history. This action is irreversible and all your data will be permanently cleared from our servers.
              </p>
            </div>

            {error && (
              <div className="text-xs text-error font-medium bg-error/[0.04] border border-error/10 p-2.5 rounded-md flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!showConfirmInput ? (
              <Button
                variant="destructive"
                size="sm"
                className="rounded-md w-full sm:w-auto"
                onClick={() => setShowConfirmInput(true)}
              >
                Delete My Account...
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="confirmInput" className="text-xs text-body font-medium">
                    To confirm, please type <span className="font-semibold text-ink font-mono select-all">delete my account</span> below:
                  </label>
                  <input
                    id="confirmInput"
                    type="text"
                    required
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="delete my account"
                    className="h-9 w-full rounded-md border border-hairline bg-canvas px-3 py-1.5 text-xs text-ink placeholder-mute focus:outline-none focus:ring-1 focus:ring-error/30 focus:border-error/30"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting || confirmText !== "delete my account"}
                    className="rounded-md flex items-center justify-center gap-1.5 w-full sm:w-auto"
                    onClick={handleDeleteAccount}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-canvas" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        Confirm Delete
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    className="rounded-md w-full sm:w-auto border border-hairline hover:bg-canvas-soft"
                    onClick={() => {
                      setShowConfirmInput(false)
                      setConfirmText("")
                      setError(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
