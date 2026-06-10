import Link from "next/link"
import { Button } from "./ui/button"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-sm bg-ink" />
            <span className="text-lg font-semibold tracking-tight">Job Stalk</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-body hover:text-ink transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm text-body hover:text-ink transition-colors">How it works</Link>
            <Link href="/pricing" className="text-sm text-body hover:text-ink transition-colors">Pricing</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">Log In</Button>
          <Button variant="primary" size="sm" className="rounded-sm">Sign Up</Button>
        </div>
      </div>
    </nav>
  )
}
