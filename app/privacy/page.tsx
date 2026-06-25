import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { APP_NAME } from "@/constants"

export const metadata: Metadata = {
  title: `Privacy Policy - ${APP_NAME}`,
  description: `Read the Privacy Policy for ${APP_NAME}. Learn how we process your inbox data, secure your credentials, and protect your privacy.`,
  openGraph: {
    title: `Privacy Policy - ${APP_NAME}`,
    description: `Read the Privacy Policy for ${APP_NAME}.`,
  },
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-canvas relative overflow-hidden mesh-gradient">
        {/* Background mesh design */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[length:32px_32px] pointer-events-none dark:opacity-20" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-preview-start/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-preview-end/10 rounded-full blur-3xl pointer-events-none" />

        <PageTransition>
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 relative">
            {/* Header */}
            <div className="text-center mb-16">
              <span className="text-sm font-mono uppercase tracking-[0.2em] text-link">Legal</span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="mt-4 text-sm text-mute">Last updated: June 26, 2026</p>
            </div>

            {/* Legal content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none text-body space-y-8">
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">1. Introduction</h2>
                <p className="leading-7 text-sm">
                  Welcome to {APP_NAME} (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy describes how we collect, use, and share information when you use our website, services, and inbox-sync automation features.
                </p>
                <p className="leading-7 text-sm">
                  By accessing or using {APP_NAME}, you consent to the collection, transfer, storage, disclosure, and use of your information as outlined in this policy.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">2. Information We Collect</h2>
                <p className="leading-7 text-sm">
                  To provide our automated job tracking dashboard, we must collect and process certain details.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm leading-6">
                  <li>
                    <strong>Account Profile Information:</strong> When you register via Google OAuth, we collect your name, email address, profile picture, and access credentials.
                  </li>
                  <li>
                    <strong>Email Communication Data:</strong> When you connect your inbox, our secure filters scan for headers, subject lines, and content related explicitly to job applications (e.g., confirmation letters, interview scheduling links, rejection notifications). We do <strong>not</strong> read, parse, or store emails unrelated to job tracking.
                  </li>
                  <li>
                    <strong>Job Application Information:</strong> We store details extracted from those emails, including company name, role, applied date, communication timeline, and status.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> We collect logs about how you navigate the dashboard, your browser type, device information, and interaction durations to improve user experience.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">3. How We Use Your Information</h2>
                <p className="leading-7 text-sm">
                  We use the information we collect solely to operate and optimize the {APP_NAME} platform:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm leading-6">
                  <li>To populate and update your automated job applications board.</li>
                  <li>To trigger &quot;ghosting detection&quot; when jobs have not seen active updates for standard intervals.</li>
                  <li>To alert you to incoming interview invites or status changes.</li>
                  <li>To analyze trends and performance to improve the automation accuracy.</li>
                  <li>To verify security and maintain account logins.</li>
                </ul>
                <p className="leading-7 text-sm font-semibold text-ink">
                  We do not, and will never, sell or rent your parsed application details or personal identity to recruiters, employers, advertising networks, or any other third parties.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">4. Data Security & Storage</h2>
                <p className="leading-7 text-sm">
                  We implement industry-standard administrative, physical, and electronic security measures to safeguard your information from unauthorized access, loss, or alteration.
                </p>
                <p className="leading-7 text-sm">
                  OAuth tokens are stored in encrypted environments, ensuring that only authorized background tasks can request secure inbox lookups. Our parsers run locally in restricted, isolated memory spaces, and your synced emails are deleted from cache as soon as metadata is extracted.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">5. Data Retention & Account Deletion</h2>
                <p className="leading-7 text-sm">
                  We retain your account details and job application lists for as long as you maintain an active account with us.
                </p>
                <p className="leading-7 text-sm">
                  You have the right to revoke our inbox access or request deletion of your account. Deletion can be initiated directly from the account settings dropdown in the navigation header. Once requested, your account profile, credentials, associated job tracking database records, and sync logs will be permanently erased from our active databases and server caches.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">6. Changes to this Policy</h2>
                <p className="leading-7 text-sm">
                  We may modify this Privacy Policy from time to time. When we make updates, we will adjust the &quot;Last updated&quot; date above. We encourage you to review this page periodically to stay informed about how we are protecting your data.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-ink border-b border-hairline pb-2">7. Contact Us</h2>
                <p className="leading-7 text-sm">
                  If you have questions, comments, or concerns regarding our privacy practices, please contact us at <a href="mailto:privacy@stalkjobs.com" className="text-link hover:underline">privacy@stalkjobs.com</a> or visit our <a href="/contact" className="text-link hover:underline">Contact Us</a> page.
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
