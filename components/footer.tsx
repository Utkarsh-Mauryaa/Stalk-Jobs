"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { APP_NAME } from "@/constants"

export function Footer() {
  const { data: session } = useSession()

  return (
    <footer className="border-t border-hairline py-16 bg-canvas-soft/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
          {/* Logo & Info column */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-20 w-20 relative overflow-hidden">
                <Image 
                  src="/StalkBlue.png" 
                  alt={`${APP_NAME} Logo`} 
                  fill
                  sizes="80px"
                  className="object-contain object-left dark:hidden"
                />
                <Image 
                  src="/StalkBlueDard.png" 
                  alt={`${APP_NAME} Logo`} 
                  fill
                  sizes="80px"
                  className="object-contain object-left hidden dark:block"
                />
              </div>
              <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
            </div>
            <p className="text-xs text-mute leading-relaxed max-w-xs">
              Automating the modern job hunt. Sync your inbox, auto-track updates, and skip the spreadsheet.
            </p>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">Product</h4>
            <Link href="/" className="text-xs text-body hover:text-ink transition-colors">Home</Link>
            <Link href={session ? "/dashboard" : "#"} className="text-xs text-body hover:text-ink transition-colors">
              Dashboard
            </Link>
          </div>

          {/* Company links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">Company</h4>
            <Link href="/about" className="text-xs text-body hover:text-ink transition-colors">About Us</Link>
            <Link href="/contact" className="text-xs text-body hover:text-ink transition-colors">Contact Us</Link>
          </div>

          {/* Legal links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">Legal</h4>
            <Link href="/privacy" className="text-xs text-body hover:text-ink transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-body hover:text-ink transition-colors">Terms & Conditions</Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-hairline pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-mute">
          <div>
            © 2026 {APP_NAME}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

