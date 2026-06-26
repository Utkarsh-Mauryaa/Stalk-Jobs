import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { APP_NAME } from "@/constants"
import { Shield, Sparkles, Zap, Users } from "lucide-react"

export const metadata: Metadata = {
  title: `About Us - ${APP_NAME}`,
  description: `Learn more about ${APP_NAME}, the team, our mission, and how we automate the job tracking process.`,
  openGraph: {
    title: `About Us - ${APP_NAME}`,
    description: `Learn more about ${APP_NAME}, our mission to simplify the job hunt, and our team.`,
  },
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-canvas relative overflow-hidden mesh-gradient">
        {/* Background mesh design */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[length:32px_32px] pointer-events-none dark:opacity-20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-preview-start/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-gradient-preview-end/10 rounded-full blur-3xl pointer-events-none" />

        <PageTransition>
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 relative">
            {/* Header */}
            <div className="text-center mb-16">
              <span className="text-sm font-mono uppercase tracking-[0.2em] text-link">Our Story</span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                About {APP_NAME}
              </h1>
              <p className="mt-6 text-lg leading-8 text-body max-w-2xl mx-auto">
                We believe that landing your dream job shouldn&apos;t require managing an outdated spreadsheet. {APP_NAME} was built to bring automation and peace of mind to the modern job hunter.
              </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-16">
              {/* Mission */}
              <div className="border border-hairline bg-canvas-soft/50 rounded-xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold tracking-tight text-ink mb-4">Our Mission</h2>
                <p className="text-body leading-7">
                  The modern job market moves fast. Candidates apply to dozens of roles, attend multiple interviews, and receive correspondence at all hours of the day. In this chaos, tracking applications becomes a job in itself.
                </p>
                <p className="mt-4 text-body leading-7">
                  Our mission is simple: <strong>eliminate the manual work from your job hunt.</strong> By seamlessly syncing with your inbox, {APP_NAME} automatically updates your tracking board, keeps tabs on interview timelines, detects when a company has &quot;ghosted&quot; you, and identifies direct recruiter contact details. We handle the administration so you can focus on preparation.
                </p>
              </div>

              {/* Core Values / Features grid */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-ink text-center mb-8">What We Stand For</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-canvas dark:bg-canvas-soft-2 dark:text-ink border border-hairline">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink">Privacy First</h3>
                      <p className="mt-2 text-sm text-body leading-6">
                        We respect your personal data. We only process application-related emails to update your dashboard, and your credentials are encrypted with bank-level security.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-canvas dark:bg-canvas-soft-2 dark:text-ink border border-hairline">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink">Zero Effort Automation</h3>
                      <p className="mt-2 text-sm text-body leading-6">
                        No copy-pasting links or manually moving boards. Our smart parsers do all the heavy lifting automatically from confirmation emails to follow-ups.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-canvas dark:bg-canvas-soft-2 dark:text-ink border border-hairline">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink">Data Integrity & Accuracy</h3>
                      <p className="mt-2 text-sm text-body leading-6">
                        Receive daily, automated status updates about active listings. Our system flags inactive roles to keep your pipeline clean.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-canvas dark:bg-canvas-soft-2 dark:text-ink border border-hairline">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink">Candidate-Centric</h3>
                      <p className="mt-2 text-sm text-body leading-6">
                        We build tools exclusively for candidates. We are not a recruiting platform, which means our loyalty lies entirely with you, the job seeker.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Tech */}
              <div className="border border-hairline bg-canvas-soft/50 rounded-xl p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold tracking-tight text-ink mb-4">How it works under the hood</h2>
                <p className="text-body leading-7">
                  {APP_NAME} leverages state-of-the-art email parsing algorithms. When you sync your inbox, our secure worker identifies job-related communication patterns, such as messages containing &quot;application received&quot;, &quot;interview request&quot;, or &quot;status update&quot;.
                </p>
                <p className="mt-4 text-body leading-7">
                  Our algorithm extracts the company name, role description, and application timeline. It compiles this information on your secure, private dashboard, letting you stay organized without running any spreadsheets.
                </p>
              </div>
            </div>
          </div>
        </PageTransition>
      </main>

      <Footer />
    </div>
  )
}
