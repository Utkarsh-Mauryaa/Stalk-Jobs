# 🎯 StalkJobs

**StalkJobs** is a modern, zero-manual-effort job application tracker that connects directly with your inbox to automatically detect, parse, and track job applications, interview schedules, and rejections.

No more tedious manual spreadsheets. Let AI do the stalking for you.

---

## 🔍 What It Does

StalkJobs connects your personal inbox to a database to automate your entire job application cycle:

1. **Auto-Logs New Applications:** When you apply to a job and get a confirmation email (e.g., from Greenhouse, Lever, Workday, LinkedIn, Indeed), StalkJobs automatically detects it, extracts the company name, role, platform, and date applied, and adds it to your dashboard.
2. **Tracks Lifecycle Status Changes:**
   * **Applied:** Set initially when confirmation is received.
   * **Ongoing:** Changes automatically when you receive interview invites, coding tests, or coordinator emails.
   * **Rejected:** Automatically flags the job as "Rejected" when a rejection email containing common negative markers (like "unfortunately") is received.
   * **Ghosted:** Flags inactive applications where no response has been heard within your configured auto-ghost timeline (default: 14 days).
3. **Builds a Recruiter Directory:** Extracts recruiter names, contact emails, and LinkedIn links directly from your emails to help you reach out and follow up quickly.
4. **Funnel Metrics Visualizer:** Gives you clean visual analytics highlighting your application success, conversion, and rejection rates.

---

## 💡 Why StalkJobs?

Keeping track of hundreds of job applications is a full-time job in itself. Spreadsheets are hard to maintain, status updates (interviews/rejections) get lost in messy inbox threads, and identifying "ghosted" applications requires constant manual dates-tracking.

StalkJobs was created to solve these exact problems:
* **Eliminate Manual Data Entry:** Automatically parses confirmation emails.
* **Auto-Update Tracking:** Automatically catches interview requests and rejections.
* **Ghost Visibility:** Visualizes which companies have stopped responding based on custom timelines.
* **Recruiter Insights:** Extracts recruiter contacts and LinkedIn profiles for proactive follow-ups.

---

## ✨ Key Features

### 1. 📬 Automated Inbox & Gmail Sync
StalkJobs securely integrates with your Gmail inbox to automatically pull down job-related notifications:
* **OAuth Scope Integrity:** Requests the narrowest read-only permission (`gmail.readonly`) to protect user privacy.
* **Token Rotation & Sync Stability:** Implements silent, automated access token refresh mechanism using offline refresh token rotation, ensuring sync never fails due to expired credentials.
* **Intelligent Query Filter:** Utilizes an optimized query payload to target job-related keywords (`application`, `interview`, `offer`, `rejected`, `position`) while explicitly excluding marketing digests, job alerts, and newsletters.
* **Deduplication Engine:** Leverages message and thread tracking IDs to avoid double-processing and prevent race conditions or database inflation during concurrent sync calls.

### 2. 🧠 LLaMA 3.1 70B AI Parsing (via NVIDIA NIM)
Unlike basic regex parsers, StalkJobs uses LLaMA 3.1 70B via the NVIDIA NIM API to run high-accuracy extraction on incoming emails:
* **Fuzzy Entity Cleanup:** Correctly normalizes company names (e.g., stripping corporate suffixes like `LLC`, `Pvt Ltd`, `Inc.`).
* **Metadata Extraction:** Extracts key application details including job title/role, platform used to apply, and contact details (recruiter's email address and LinkedIn profile, if visible).
* **Fuzzy Job Matching:** Intelligently matches incoming emails to existing entries in the database by thread ID or company-role name proximity (supporting substring matching and company-wide defaults).
* **Robust Rate-Limit Recovery:** Captures 429 errors from the API, parses retry instructions from the `retry-after` header, and implements staggered exponential backoff retry policies.

### 3. 👻 Auto-Ghost Detection
Applications that lack responses or updates are flagged automatically:
* **Flexible Thresholds:** Tracks status state change history and updates the application status to `Ghosted` if no new email is received or interaction is logged within a configurable time window (default is 14 days, min 7 days).
* **Automated Sync & Cron Tasks:** Integrates a secure CRON endpoint (`/api/jobs/ghost`) protected by custom secret verification headers that can be triggered by external cron services to run mass status updates.

### 4. 🎛️ Unified Analytics Dashboard
A dark-mode-first developer-centric dashboard designed with rich aesthetics:
* **Funnel Visualization:** Real-time statistics cards indicating progress (Applied, Ongoing, Ghosted, Rejected).
* **Instant Filtering & Searching:** Responsive debounced client-side searches coupled with state filters.
* **Optimized Pagination:** Paginated database queries prevent UI load lag, serving results dynamically as the user scrolls.
* **Modern Aesthetic:** Tailwind CSS v4 styling, custom mesh gradients, and micro-interactions powered by Framer Motion.

---

## 🛠️ Tech Stack & Architecture

StalkJobs is built on a modern, robust, and production-ready tech stack:

* **Framework:** Next.js 16 (App Router)
* **Library:** React 19 (Server Actions & Server Components)
* **Styling:** Tailwind CSS 4 & Framer Motion
* **Database:** PostgreSQL (via Neon Serverless)
* **ORM:** Prisma ORM
* **Authentication:** NextAuth.js v5 (Google OAuth with offline access for refresh token rotation)
* **AI Processing:** LLaMA-3.1-70b-Instruct (via NVIDIA NIM API)

### 🔄 The Sync Workflow

```
[User Inbox] ──(Sync Trigger)──> [Gmail API (gmail.readonly)]
                                        │
                                 (Fetch New Emails)
                                        ▼
[Database (Prisma)] <──(Match)── [LLaMA 3.1 Parser]
        │
  (Save/Update)
        ▼
[Minimalist UI Dashboard]
```

---

## 🚀 Getting Started

### 📋 Prerequisites
* Node.js (v18+)
* PostgreSQL database (e.g., Neon.tech)
* Google Developer Console credentials (with Gmail Readonly scope enabled)
* NVIDIA NIM API Key (or OpenAI-compatible alternative)

### 🔧 Setup Steps

1. **Clone the repository and install dependencies:**
   ```bash
   git clone https://github.com/Utkarsh-Mauryaa/Stalk-Jobs.git
   cd stalkjobs
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   DATABASE_URL="postgresql://..."
   
   # NextAuth
   AUTH_SECRET="your-nextauth-secret"
   AUTH_GOOGLE_ID="your-google-oauth-client-id"
   AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"
   
   # AI Provider (NVIDIA NIM)
   MINIMAX_API_KEY="your-nvidia-nim-api-key"
   ```

3. **Initialize the database schema:**
   ```bash
   npx prisma db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard in action.

