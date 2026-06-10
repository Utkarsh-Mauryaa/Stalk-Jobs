# StalkJobs

StalkJobs is a modern, zero-manual-effort job application tracker that integrates with the user's inbox to automatically detect and track job applications, interviews, and rejections.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Language:** TypeScript

## Architecture & Conventions

- **Directory Structure:**
  - `app/`: Next.js App Router pages and layouts.
  - `components/`: Feature-specific and shared React components.
  - `components/ui/`: Atomic UI primitives (e.g., Button, Badge, Dialog).
  - `lib/`: Utility functions and shared logic.
  - `public/`: Static assets.
- **Styling Patterns:**
  - Uses Tailwind CSS 4 with a custom `@theme` block in `app/globals.css`.
  - Design aesthetic: Minimalist, "Vercel-style" (Geist font, monochrome with intentional accents, mesh gradients).
  - Custom colors: `ink`, `body`, `mute`, `canvas`, `hairline`, `success`, `error`, `warning`.
  - Responsive and accessible by default.
- **Coding Standards:**
  - Strict TypeScript usage.
  - Path alias `@/*` points to the root directory.
  - Components are functional and use `use client` where interactivity or animations are required.
  - Utility `cn` (in `lib/utils.ts`) is used for conditional class merging.

## Core Features (Current/Planned)

- **Email Automation:** Automatic detection of application-related emails.
- **Ghost Detection:** Automated marking of inactive applications.
- **Smart CRM:** Identification of hiring manager contact info.
- **Dashboard:** Real-time view of application statuses.

## Development Workflow

- **Run Dev:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
