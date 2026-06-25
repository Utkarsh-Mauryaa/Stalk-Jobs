"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { signIn, signOut, useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import { Menu, X } from "lucide-react"

import { APP_NAME } from "@/constants"

const ThemeToggle = dynamic(() => import("@/components/theme-toggle").then(mod => mod.ThemeToggle), {
  ssr: false,
  loading: () => <div className="h-8 w-8 rounded-sm bg-hairline animate-pulse" />
})

export function Navbar() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="h-6 w-6 rounded-sm bg-ink transition-colors group-hover:bg-ink/90" 
            />
            <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-body hover:text-ink transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-ink transition-all group-hover:w-full" />
            </Link>
            {session && (
              <Link href="/dashboard" className="text-sm text-body hover:text-ink transition-colors relative group">
                Applications
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-ink transition-all group-hover:w-full" />
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Desktop Navigation / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="h-4 w-[1px] bg-hairline mx-1" />
            {status === "loading" ? (
              <div className="h-8 w-20 animate-pulse rounded-sm bg-hairline" />
            ) : session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="rounded-sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                >
                  Log In
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="rounded-sm"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  >
                    Sign Up
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden h-8 w-8 rounded-sm hover:bg-canvas-soft border border-hairline/10"
          >
            {isOpen ? <X className="h-4 w-4 text-ink" /> : <Menu className="h-4 w-4 text-ink" />}
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t border-hairline bg-canvas/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <div className="flex flex-col gap-1">
                <Link 
                  href="/" 
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-body hover:text-ink hover:bg-canvas-soft rounded transition-colors"
                >
                  Home
                </Link>
                {session && (
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-body hover:text-ink hover:bg-canvas-soft rounded transition-colors"
                  >
                    Applications
                  </Link>
                )}
              </div>
              <div className="h-[1px] bg-hairline my-2 mx-3" />
              <div className="flex flex-col gap-2 px-3">
                {status === "loading" ? (
                  <div className="h-9 w-full animate-pulse rounded-sm bg-hairline" />
                ) : session ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} className="w-full">
                      <Button variant="ghost" className="w-full justify-center">Dashboard</Button>
                    </Link>
                    <Button 
                      variant="primary" 
                      className="w-full rounded-sm justify-center"
                      onClick={() => {
                        setIsOpen(false)
                        signOut({ callbackUrl: "/" })
                      }}
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center"
                      onClick={() => {
                        setIsOpen(false)
                        signIn("google", { callbackUrl: "/dashboard" })
                      }}
                    >
                      Log In
                    </Button>
                    <Button 
                      variant="primary" 
                      className="w-full rounded-sm justify-center"
                      onClick={() => {
                        setIsOpen(false)
                        signIn("google", { callbackUrl: "/dashboard" })
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

