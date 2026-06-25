"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FAQSection } from "@/components/faq-section"
import { PageTransition } from "@/components/page-transition"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        <PageTransition>
          <Hero />
          <FeaturesSection />
          <HowItWorksSection />
          <FAQSection />
        </PageTransition>
      </main>

      <Footer />
    </div>
  )
}
