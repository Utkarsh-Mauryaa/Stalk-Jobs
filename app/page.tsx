import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Mail, Zap, Shield, Search } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48 mesh-gradient">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas-soft px-3 py-1 text-xs font-medium text-body mb-8">
                <span className="flex h-2 w-2 rounded-full bg-success" />
                Now in Private Beta
              </div>
              <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-ink sm:text-7xl mb-8">
                Stalk your dream job.<br />
                <span className="text-mute">Zero manual effort.</span>
              </h1>
              <p className="max-w-2xl text-lg text-body mb-10">
                The first job application tracker that lives in your inbox. 
                Auto-detect applications, rejections, and interviews without lifting a finger.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2">
                  Get Started for Free <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="secondary">
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-24 bg-canvas">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 bg-canvas-soft border-y border-hairline">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-ink mb-4">How it works</h2>
              <p className="text-body max-w-xl mx-auto">Three steps to a cleaner job hunt.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
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
            </div>
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
    <div className="p-8 rounded-xl border border-hairline bg-canvas shadow-level-2 hover:shadow-level-3 transition-shadow">
      <div className="h-10 w-10 rounded-lg bg-canvas-soft flex items-center justify-center border border-hairline mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink mb-3">{title}</h3>
      <p className="text-sm text-body leading-relaxed">{description}</p>
    </div>
  )
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex flex-col">
      <div className="text-4xl font-mono text-hairline-strong mb-4">{number}</div>
      <h3 className="text-xl font-semibold text-ink mb-3">{title}</h3>
      <p className="text-body text-sm leading-relaxed">{description}</p>
    </div>
  )
}
