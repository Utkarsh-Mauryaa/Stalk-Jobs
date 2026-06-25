"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Send, CheckCircle2, ArrowRight } from "lucide-react"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSuccess(true)
    setName("")
    setEmail("")
    setSubject("")
    setMessage("")
  }

  return (
    <div className="w-full border border-hairline bg-canvas-soft/40 backdrop-blur-sm rounded-xl p-6 sm:p-8">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.form
            key="contact-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-body">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder-mute focus:outline-none focus:ring-1 focus:ring-ink/20"
                />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-body">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder-mute focus:outline-none focus:ring-1 focus:ring-ink/20"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="subject" className="text-xs font-mono uppercase tracking-wider text-body">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What can we help you with?"
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder-mute focus:outline-none focus:ring-1 focus:ring-ink/20"
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="message" className="text-xs font-mono uppercase tracking-wider text-body">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us more about your inquiry..."
                className="w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder-mute focus:outline-none focus:ring-1 focus:ring-ink/20 resize-none"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-canvas"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending message...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="contact-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center text-center py-10"
          >
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">Message Sent Successfully!</h3>
            <p className="text-body max-w-sm mb-6 text-sm">
              Thank you for reaching out. A member of our support team will get back to you within 24 hours.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSuccess(false)}
              className="flex items-center gap-2"
            >
              Send Another Message
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
