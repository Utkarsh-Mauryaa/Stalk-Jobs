"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface FAQItem {
  question: string
  seoQuestion: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is a job tracker tool?",
    seoQuestion: "what is a job tracker tool?",
    answer: "A job tracker tool is a digital platform designed to help job seekers organize, monitor, and manage their job applications throughout the hiring pipeline. Instead of relying on memory, a job tracker tool aggregates all your data into a unified dashboard, showing you exactly where each application stands—from initial submission to the final offer. StalkJobs automates this by syncing with your inbox to track applications automatically."
  },
  {
    question: "What is a job application tracker?",
    seoQuestion: "what is a job application tracker",
    answer: "A job application tracker is a specialized database or system that logs key details of your job search, such as company names, job titles, salary estimates, application dates, and recruiter contact info. Using a job application tracker helps you monitor interview invitations and follow-up deadlines, ensuring you never miss an opportunity."
  },
  {
    question: "How does StalkJobs compare to a Job Application Tracker Google Sheets template?",
    seoQuestion: "Job application tracker Google Sheets",
    answer: "While a Job Application Tracker Google Sheets spreadsheet is a common starting point, it requires tedious manual data entry and updates. You have to copy-paste job links and manually change statuses. StalkJobs offers a fully automated alternative: it scans your email inbox to identify job applications, detect interviews, flag rejections, and update your dashboard in real-time, giving you a set-it-and-forget-it tracking experience."
  },
  {
    question: "Is there a free Job Application Tracker available?",
    seoQuestion: "Job application tracker free",
    answer: "Yes, StalkJobs offers a robust Job Application Tracker Free plan. This plan allows you to automatically track your job search, sync your inbox, view your dashboard in real-time, and get smart updates. It’s the perfect free solution for managing your search without paying for expensive tools."
  },
  {
    question: "What is a Job Tracker Website App?",
    seoQuestion: "Job tracker website app",
    answer: "A Job Tracker Website App is a web-based software application that you can access from any browser or device (mobile, tablet, or desktop) to manage your career search. StalkJobs is a modern job tracker website app that integrates with your email to scan, categorize, and present your application pipeline in a clean, visual format."
  },
  {
    question: "Why use Job Application Tracking Software?",
    seoQuestion: "Job application tracking software",
    answer: "Job Application Tracking Software is essential for active job seekers applying to multiple positions. It helps avoid duplicate applications, logs interview dates, tracks response rates, and automatically detects when a role has gone cold. By automating the follow-up process, it ensures you remain top-of-mind for recruiters."
  },
  {
    question: "Is this Job Tracker Website free to use?",
    seoQuestion: "Job tracker website free",
    answer: "Yes! StalkJobs is a job tracker website free to start. Our core tracking features, dashboard, and automated email sync are available at no charge, so you can track your applications, monitor progress, and manage interviews without adding any financial burden during your job hunt."
  },
  {
    question: "Why choose a free Job Application Tracker Website?",
    seoQuestion: "Job application tracker website free",
    answer: "Choosing a job application tracker website free plan like StalkJobs allows you to streamline your job search without any overhead. It provides professional-grade dashboard analytics, automatic sync features, and ghosting detection without any cost, ensuring that high-quality tracking tools are accessible to every job seeker."
  }
]

export function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  // Generate the JSON-LD schema for FAQPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map((item) => ({
      "@type": "Question",
      "name": item.seoQuestion,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }

  return (
    <section id="faq" className="py-16 sm:py-24 bg-canvas border-t border-hairline relative overflow-hidden">
      {/* Mesh background grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[length:32px_32px] pointer-events-none dark:opacity-20" />
      
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-link mb-4">FAQ</h2>
          <h3 className="text-4xl font-bold tracking-tight text-ink">Frequently Asked Questions</h3>
          <p className="mt-4 text-body max-w-lg mx-auto">
            Everything you need to know about tracking your job applications with StalkJobs.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = activeIndex === index
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border border-hairline rounded-lg bg-canvas-soft overflow-hidden transition-colors hover:border-hairline-strong"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between p-5 text-left font-medium text-ink focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold pr-4">{item.question}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-mute" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-hairline/50 text-body leading-relaxed text-sm sm:text-base">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
