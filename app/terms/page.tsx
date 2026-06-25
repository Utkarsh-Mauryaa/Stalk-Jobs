import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { APP_NAME } from "@/constants"

export const metadata: Metadata = {
  title: `Terms & Conditions - ${APP_NAME}`,
  description: `Read the Terms & Conditions of Service for ${APP_NAME}. Learn about user accounts, acceptable use, disclaimers, and limitation of liability.`,
  openGraph: {
    title: `Terms & Conditions - ${APP_NAME}`,
    description: `Read the Terms & Conditions for ${APP_NAME}.`,
  },
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-canvas relative overflow-hidden mesh-gradient">
        {/* Background mesh design */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[length:32px_32px] pointer-events-none dark:opacity-20" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-gradient-preview-start/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-gradient-preview-end/10 rounded-full blur-3xl pointer-events-none" />

        <PageTransition>
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 relative">
            {/* Header */}
            <div className="text-center mb-16">
              <span className="text-sm font-mono uppercase tracking-[0.2em] text-link">Legal</span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                Terms & Conditions
              </h1>
              <p className="mt-4 text-sm text-mute">Last updated: June 26, 2026</p>
            </div>

            {/* Legal content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none text-body space-y-8">
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">1. Agreement to Terms</h2>
                <p className="leading-7 text-sm">
                  These Terms & Conditions (&quot;Terms&quot;) constitute a legally binding agreement made between you and {APP_NAME} concerning your access to and use of our website and services.
                </p>
                <p className="leading-7 text-sm">
                  By registering an account, linking your email, or browsing our site, you acknowledge that you have read, understood, and agreed to be bound by these Terms. If you do not agree to these Terms, you are prohibited from using the service and must cease access immediately.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">2. Description of Services</h2>
                <p className="leading-7 text-sm">
                  {APP_NAME} provides a job application tracker that syncs with your inbox to parse job application status details. Features include:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm leading-6">
                  <li>Automatic email scanning and classification of application-related communication.</li>
                  <li>Real-time status updates on a web-based board.</li>
                  <li>Automated &quot;ghosting detection&quot; for inactive applications.</li>
                </ul>
                <p className="leading-7 text-sm">
                  We reserve the right to modify, suspend, or terminate parts or all of these services at any time without prior notice.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">3. User Accounts & Security</h2>
                <p className="leading-7 text-sm">
                  To access our automated features, you must log in via an authorized Google OAuth account.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm leading-6">
                  <li>You must provide accurate, current, and complete registration information.</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials and OAuth keys.</li>
                  <li>You must notify us immediately of any unauthorized use or security breaches regarding your {APP_NAME} account.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">4. Acceptable Use Policy</h2>
                <p className="leading-7 text-sm">
                  When using {APP_NAME}, you agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm leading-6">
                  <li>Attempt to bypass, disable, or interfere with security-related features of the service.</li>
                  <li>Reverse engineer, decompile, or disassemble any part of the site&apos;s code or parsers.</li>
                  <li>Use the service for spamming, harassment, or transmitting malware.</li>
                  <li>Use automated bots or scripts to scrape, crawl, or extract data from {APP_NAME} servers without authorization.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">5. Disclaimers</h2>
                <p className="leading-7 text-sm">
                  The service is provided on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis.
                </p>
                <p className="leading-7 text-sm">
                  While we strive to maintain high accuracy, we do <strong>not</strong> guarantee that our email parsing tools will detect every job application, interview invite, or status update correctly. Email formatting varies widely between companies and recruitment platforms, and parser errors can occur.
                </p>
                <p className="leading-7 text-sm">
                  {APP_NAME} disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">6. Limitation of Liability</h2>
                <p className="leading-7 text-sm">
                  In no event will {APP_NAME}, its directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, or punitive damages—including lost profits, lost data, or missed job opportunities—arising from your use of the service.
                </p>
                <p className="leading-7 text-sm">
                  Use of the service and email syncing is entirely at your own risk.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">7. Governing Law</h2>
                <p className="leading-7 text-sm">
                  These Terms shall be governed by and defined in accordance with the laws of India, without regard to its conflict of law principles. You consent to the exclusive jurisdiction of courts located in New Delhi for any disputes arising under this agreement.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">8. Contact Us</h2>
                <p className="leading-7 text-sm">
                  If you have questions or require clarification regarding these Terms, please contact us at <a href="mailto:terms@stalkjobs.com" className="text-link hover:underline">terms@stalkjobs.com</a> or visit our <a href="/contact" className="text-link hover:underline">Contact Us</a> page.
                </p>
              </section>
            </div>
          </div>
        </PageTransition>
      </main>

      <Footer />
    </div>
  )
}
