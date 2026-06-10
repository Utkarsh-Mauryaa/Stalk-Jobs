"use client"

import { motion } from "framer-motion"

const platforms = [
  {
    name: "LinkedIn",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    )
  },
  {
    name: "Indeed",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M2.39 1.35c-.67 0-1.21.54-1.21 1.21v18.88c0 .67.54 1.21 1.21 1.21h19.22c.67 0 1.21-.54 1.21-1.21V2.56c0-.67-.54-1.21-1.21-1.21H2.39zm1.8 4.5h2.7v12.3h-2.7V5.85zm4.05 0h2.7v1.35c.45-.9 1.35-1.35 2.25-1.35 2.25 0 3.15 1.35 3.15 3.6v8.7h-2.7v-7.65c0-.9-.45-1.35-1.35-1.35-.9 0-1.35.45-1.35 1.35v7.65h-2.7V5.85z"/>
      </svg>
    )
  },
  {
    name: "Wellfound",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.998 8.128c.063-1.379-1.612-2.376-2.795-1.664-1.23.598-1.322 2.52-.156 3.234 1.2.862 2.995-.09 2.951-1.57zm0 7.748c.063-1.38-1.612-2.377-2.795-1.665-1.23.598-1.322 2.52-.156 3.234 1.2.863 2.995-.09 2.951-1.57zm-20.5 1.762L0 6.364h3.257l2.066 8.106 2.245-8.106h3.267l2.244 8.106 2.065-8.106h3.257l-3.54 11.274H11.39c-.73-2.713-1.46-5.426-2.188-8.14l-2.233 8.14H3.5z"/>
      </svg>
    )
  },
  {
    name: "Glassdoor",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.5 18h-3v-12h3v12zm6 0h-3v-6h3v6zm0-9h-3v-3h3v3z"/>
      </svg>
    )
  },
  {
    name: "X",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/>
      </svg>
    )
  },
  {
    name: "Upwork",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.561 3.322c-2.544 0-4.535 1.903-5.177 4.423l-2.053 8.106-1.979-8.106c-.566-2.428-2.222-4.423-4.604-4.423-2.456 0-4.448 1.991-4.448 4.448v12.908h2.7v-12.908c0-.966.784-1.75 1.75-1.75s1.75.784 1.75 1.75l2.233 9.158h2.7l2.233-9.158c.311-1.274 1.315-2.233 2.544-2.233 1.408 0 2.552 1.144 2.552 2.552v9.598h2.7v-9.598c0-2.899-2.353-5.252-5.252-5.252z"/>
      </svg>
    )
  },
  {
    name: "Fiverr",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5l-1.89 3.2-3.61.82.34 3.69L1 12l2.44 2.79-.34 3.69 3.61.82 1.89 3.2L12 21.04l3.4 1.46 1.89-3.2 3.61-.82-.34-3.69L23 12zm-12.91 4.72h-2.18v-4.45h-1.18v-1.82h1.18v-.32c0-1.56.88-2.47 2.41-2.47.58 0 1.05.1 1.36.21v1.77c-.18-.07-.44-.11-.7-.11-.51 0-.89.26-.89.82v.1h1.59v1.82h-1.59v4.45z"/>
      </svg>
    )
  },
]

export function LogoMarquee() {
  const duplicatedPlatforms = [...platforms, ...platforms, ...platforms]

  return (
    <div className="w-full py-16 overflow-hidden bg-transparent relative mt-8">
      {/* Gradient Masks */}
      <div className="absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-canvas to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-canvas to-transparent z-10 pointer-events-none" />
      
      <div className="flex flex-col items-center gap-10">
        <span className="text-[10px] font-bold text-mute uppercase tracking-[0.3em] opacity-80">
          Supported Platforms
        </span>
        
        <div className="w-full relative">
          <motion.div 
            className="flex whitespace-nowrap gap-16 sm:gap-24 items-center w-max"
            animate={{
              x: ["0%", "-33.33%"]
            }}
            transition={{
              duration: 35,
              ease: "linear",
              repeat: Infinity
            }}
          >
            {duplicatedPlatforms.map((platform, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 text-mute/40 hover:text-ink transition-colors cursor-default group"
              >
                <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                  {platform.logo}
                </div>
                <span className="text-xl sm:text-2xl font-bold tracking-tighter">
                  {platform.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
