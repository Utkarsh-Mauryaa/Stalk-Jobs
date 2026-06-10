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
        <path d="M11.566 21.5633v-8.762c0.2553 0.0231 0.5009 0.0346 0.758 0.0346 1.2225 0 2.3739 -0.3206 3.3506 -0.8928v9.6182c0 0.8219 -0.1957 1.4287 -0.5757 1.8338 -0.378 0.4033 -0.8808 0.6049 -1.491 0.6049 -0.6007 0 -1.0766 -0.2016 -1.468 -0.6183 -0.3781 -0.4032 -0.5739 -1.01 -0.5739 -1.8184zM11.589 0.5659c2.5447 -0.8929 5.4424 -0.8449 7.6186 0.987 0.405 0.3687 0.8673 0.8334 1.0515 1.3806 0.2207 0.6913 -0.7695 -0.073 -0.9057 -0.167 -0.71 -0.4532 -1.4182 -0.8334 -2.2127 -1.0946C12.8614 0.3873 8.8122 2.709 6.2945 6.315c-1.0516 1.5939 -1.7367 3.2721 -2.299 5.1174 -0.0614 0.2017 -0.1094 0.4647 -0.2207 0.6413 -0.1113 0.2036 -0.048 -0.5453 -0.048 -0.5702 0.0845 -0.7623 0.2438 -1.4997 0.4414 -2.237 1.161 -3.929 3.7288 -7.201 7.4209 -8.7007zm4.9281 7.0587c0 1.6686 -1.353 3.0224 -3.0205 3.0224 -1.6677 0 -3.0186 -1.3538 -3.0186 -3.0224 0 -1.6687 1.351 -3.0224 3.0186 -3.0224 1.6676 0 3.0205 1.3518 3.0205 3.0224Z"/>
      </svg>
    )
  },
  {
    name: "Wellfound",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.998 8.128c0.063 -1.379 -1.612 -2.376 -2.795 -1.664 -1.23 0.598 -1.322 2.52 -0.156 3.234 1.2 0.862 2.995 -0.09 2.951 -1.57zm0 7.748c0.063 -1.38 -1.612 -2.377 -2.795 -1.665 -1.23 0.598 -1.322 2.52 -0.156 3.234 1.2 0.863 2.995 -0.09 2.951 -1.57zm-20.5 1.762L0 6.364h3.257l2.066 8.106 2.245 -8.106h3.267l2.244 8.106 2.065 -8.106h3.257l-3.54 11.274H11.39c-0.73 -2.713 -1.46 -5.426 -2.188 -8.14l-2.233 8.14H3.5z"/>
      </svg>
    )
  },
  {
    name: "Glassdoor",
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M14.1093 0.0006c-0.0749 -0.0074 -0.1348 0.0522 -0.1348 0.127v3.451c0 0.0673 0.0537 0.1194 0.121 0.127 2.619 0.172 4.6092 0.9501 4.6092 3.6814H13.086a0.1343 0.1343 0 0 0 -0.1348 0.1347v8.9644c0 0.0748 0.06 0.1347 0.1348 0.1347h10.0034c0.0748 0 0.1347 -0.0599 0.1347 -0.1347V7.342c0 -2.2374 -0.7996 -4.0558 -2.4159 -5.3279C19.3191 0.8469 17.0874 0.1428 14.1093 0.0006ZM0.9107 7.387a0.1342 0.1342 0 0 0 -0.1347.1347v8.9566c0 0.0748 0.06 0.1347 0.1347 0.1347h5.6189c0 2.7313 -1.9902 3.5094 -4.6091 3.6815 -0.0674 0.0075 -0.1192 0.0596 -0.1192 0.127v3.451c0 0.0747 0.06 0.1343 0.1348 0.1269 2.9781 -0.1422 5.2078 -0.8463 6.6969 -2.0136 1.6163 -1.272 2.4159 -3.0905 2.4159 -5.3278V7.5217a0.1343 0.1343 0 0 0 -0.1348 -0.1347z"/>
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
      <svg viewBox="0 0 640 640" fill="currentColor" className="w-5 h-5">
        <path d="M493.9 359.6C443.6 359.6 410.4 320.7 401.1 305.7C413 210.4 447.9 180.3 493.9 180.3C539.4 180.3 574.8 216.7 574.8 270C574.8 323.3 539.4 359.7 493.9 359.7L493.9 359.6zM493.9 121.8C412 121.8 366.1 175.2 352.9 230.2C338 202.2 327 164.7 318.4 129.9L205.2 129.9L205.2 270.9C205.2 322 181.9 359.9 136.4 359.9C90.9 359.9 64.8 322.1 64.8 270.9L65.3 129.9L0 129.9L0 270.9C0 312 13.3 349.3 37.6 376C62.6 403.5 96.8 417.8 136.4 417.8C215.2 417.8 270.2 357.4 270.2 270.9L270.2 176.1C278.4 207.3 298 267.2 335.5 319.7L300.5 519.1L366.9 519.1L390 377.8C397.6 384.1 405.7 389.8 414.2 394.8C436.4 408.8 461.9 416.7 488.1 417.6C488.1 417.6 492.1 417.8 494.2 417.8C575.4 417.8 640.1 354.9 640.1 270C640.1 185.1 575.3 121.9 494.1 121.9L493.9 121.8z"/>
      </svg>
    )
  },
  {
    name: "Fiverr",
    logo: (
      <svg viewBox="-2.5 -2 24 24" fill="currentColor" className="w-5 h-5">
        <path d='M16.25 16.25v-10h-10v-.625c0-1.034.841-1.875 1.875-1.875H10V0H8.125A5.632 5.632 0 0 0 2.5 5.625v.625H0V10h2.5v6.25H0V20h8.75v-3.75h-2.5V10h6.285v6.25H10V20h8.75v-3.75h-2.5z'/><circle cx='14.375' cy='1.875' r='1.875'/>
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
