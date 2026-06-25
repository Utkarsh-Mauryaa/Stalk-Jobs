import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact-form"
import { PageTransition } from "@/components/page-transition"
import { APP_NAME } from "@/constants"
import { Mail, MessageSquare, Clock, Globe } from "lucide-react"

export const metadata: Metadata = {
  title: `Contact Us - ${APP_NAME}`,
  description: `Get in touch with the ${APP_NAME} team. We are here to answer your questions, handle inquiries, and receive feedback.`,
  openGraph: {
    title: `Contact Us - ${APP_NAME}`,
    description: `Get in touch with the ${APP_NAME} team.`,
  },
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-canvas relative overflow-hidden mesh-gradient">
        {/* Background mesh design */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[length:32px_32px] pointer-events-none dark:opacity-20" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-preview-start/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-preview-end/10 rounded-full blur-3xl pointer-events-none" />

        <PageTransition>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 relative">
            <div className="text-center mb-16">
              <span className="text-sm font-mono uppercase tracking-[0.2em] text-link">Get In Touch</span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                Contact Our Team
              </h1>
              <p className="mt-6 text-lg leading-8 text-body max-w-2xl mx-auto">
                Have questions about syncing your inbox, feature suggestions, or need custom enterprise tracking? Drop us a line.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Contact info panel */}
              <div className="lg:col-span-5 space-y-8">
                <div className="border border-hairline bg-canvas-soft/30 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-xl font-bold text-ink mb-6">Contact Information</h2>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-canvas-soft border border-hairline text-ink">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">Email Support</h3>
                        <p className="mt-1 text-sm text-body">support@stalkjobs.com</p>
                        <p className="text-xs text-mute">For general questions and sync issues.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-canvas-soft border border-hairline text-ink">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">FAQ & Community</h3>
                        <p className="mt-1 text-sm text-body">
                          Check out our FAQ section below for quick answers to common questions.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-canvas-soft border border-hairline text-ink">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">Response Time</h3>
                        <p className="mt-1 text-sm text-body">Under 24 hours</p>
                        <p className="text-xs text-mute">We operate Monday through Friday.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-canvas-soft border border-hairline text-ink">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">Press & Careers</h3>
                        <p className="mt-1 text-sm text-body">press@stalkjobs.com</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-hairline bg-canvas-soft/30 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="font-semibold text-ink mb-2">Need a faster response?</h3>
                  <p className="text-sm text-body">
                    If you are logged into your dashboard, you can trigger a manual sync to fetch recent application updates or contact us directly at support@stalkjobs.com.
                  </p>
                </div>
              </div>

              {/* Form container */}
              <div className="lg:col-span-7">
                <ContactForm />
              </div>
            </div>
          </div>
        </PageTransition>
      </main>

      <Footer />
    </div>
  )
}
