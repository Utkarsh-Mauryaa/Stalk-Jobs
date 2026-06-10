"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { signIn, signOut, useSession } from "next-auth/react"

import { APP_NAME } from "@/constants"

export function Navbar() {
  const { data: session, status } = useSession()

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
                onClick={() => signOut()}
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
      </div>
    </motion.nav>
  )
}

