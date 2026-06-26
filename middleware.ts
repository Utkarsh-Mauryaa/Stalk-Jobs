import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Simple in-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60 // 60 requests per minute

function isRateLimited(ip: string): { limited: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  let record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS }
  }

  record.count++
  rateLimitStore.set(ip, record)

  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - record.count)
  const resetSeconds = Math.ceil((record.resetTime - now) / 1000)

  return {
    limited: record.count > MAX_REQUESTS_PER_WINDOW,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining,
    reset: resetSeconds,
  }
}

// Trusted CORS origins
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"]

export default auth((req) => {
  const url = req.nextUrl
  const origin = req.headers.get("origin")
  const method = req.method

  const isApiRoute = url.pathname.startsWith("/api/")
  const isAuthApi = url.pathname.startsWith("/api/auth/")

  // 1. CORS check for all API routes (except next-auth internal APIs under /api/auth)
  if (isApiRoute && !isAuthApi) {
    // A request is allowed if it is same-origin (origin matches the server's own origin) OR if it matches one of the trusted origins
    const isAllowedOrigin = origin ? (origin === url.origin || ALLOWED_ORIGINS.includes(origin)) : true

    // Handle Preflight OPTIONS Request
    if (method === "OPTIONS") {
      if (origin && !isAllowedOrigin) {
        return new NextResponse(null, { status: 400, statusText: "CORS Not Allowed" })
      }
      const response = new NextResponse(null, { status: 204 })
      if (origin) {
        response.headers.set("Access-Control-Allow-Origin", origin)
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-csrf-token")
        response.headers.set("Access-Control-Max-Age", "86400")
      }
      return response
    }

    if (origin && !isAllowedOrigin) {
      return NextResponse.json({ error: "CORS origin not allowed" }, { status: 403 })
    }

    // 2. Rate Limiting for all API routes
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1"
    const limitInfo = isRateLimited(ip)

    if (limitInfo.limited) {
      const response = NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
      response.headers.set("X-RateLimit-Limit", limitInfo.limit.toString())
      response.headers.set("X-RateLimit-Remaining", "0")
      response.headers.set("X-RateLimit-Reset", limitInfo.reset.toString())
      response.headers.set("Retry-After", limitInfo.reset.toString())
      return response
    }

    // 3. CSRF protection for state-changing API requests (POST, PUT, DELETE, PATCH)
    const isStateChanging = ["POST", "PUT", "DELETE", "PATCH"].includes(method)
    const hasAuthHeader = req.headers.has("authorization")

    if (isStateChanging && !hasAuthHeader) {
      const cookieToken = req.cookies.get("csrf-token")?.value
      const headerToken = req.headers.get("x-csrf-token") || req.headers.get("X-CSRF-Token")

      if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return NextResponse.json({ error: "Invalid or missing CSRF token" }, { status: 403 })
      }
    }
  }

  // 4. Authentication check for dashboard routes
  if (url.pathname.startsWith("/dashboard")) {
    const session = req.auth
    if (!session) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // 5. Build standard response and apply cookies/CORS
  const response = NextResponse.next()

  // Apply CORS headers for actual API response if valid origin is present
  if (isApiRoute && !isAuthApi && origin && (origin === url.origin || ALLOWED_ORIGINS.includes(origin))) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-csrf-token")
  }

  // Inject rate-limit headers in the API response
  if (isApiRoute && !isAuthApi) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1"
    const record = rateLimitStore.get(ip)
    if (record) {
      const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - record.count)
      const resetSeconds = Math.ceil((record.resetTime - Date.now()) / 1000)
      response.headers.set("X-RateLimit-Limit", MAX_REQUESTS_PER_WINDOW.toString())
      response.headers.set("X-RateLimit-Remaining", remaining.toString())
      response.headers.set("X-RateLimit-Reset", resetSeconds.toString())
    }
  }

  // CSRF Double-Submit cookie initialization:
  // If the 'csrf-token' cookie is not present, we set it on any GET/Page request or API request
  const existingCsrfToken = req.cookies.get("csrf-token")?.value
  if (!existingCsrfToken) {
    const newCsrfToken = crypto.randomUUID()
    response.cookies.set("csrf-token", newCsrfToken, {
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false, // Must be readable by client JS to append to headers
    })
  }

  return response
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
