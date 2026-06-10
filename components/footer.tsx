"use client"

import Link from "next/link"

import { APP_NAME } from "@/constants"

export function Footer() {
  return (
    <footer className="border-t border-hairline py-12 bg-canvas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-sm bg-ink" />
          <span className="text-sm font-semibold">{APP_NAME}</span>
        </div>
        <div className="text-sm text-mute">
          © 2026 {APP_NAME}. Built for the modern job hunter.
        </div>
        <div className="flex gap-6">
          <Link href="#" className="text-sm text-body hover:text-ink">Privacy</Link>
          <Link href="#" className="text-sm text-body hover:text-ink">Terms</Link>
          <Link href="#" className="text-sm text-body hover:text-ink">X / Twitter</Link>
        </div>
      </div>
    </footer>
  )
}
