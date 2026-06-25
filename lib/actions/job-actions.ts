"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { Job, JobStatus } from "@/types/job"

export async function addJobAction(data: {
  company: string
  role: string
  platform: string
  status: string
  appliedDate: string
  notes?: string
  autoGhostDays?: number
  contactEmail?: string | null
}) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Server-side input validation
  if (typeof data.company !== "string" || !data.company.trim() || data.company.length > 200) {
    throw new Error("Invalid company name. Must be between 1 and 200 characters.")
  }
  if (typeof data.role !== "string" || !data.role.trim() || data.role.length > 200) {
    throw new Error("Invalid role name. Must be between 1 and 200 characters.")
  }
  if (typeof data.platform !== "string" || !data.platform.trim() || data.platform.length > 100) {
    throw new Error("Invalid platform name. Must be between 1 and 100 characters.")
  }
  const validStatuses = ["applied", "ongoing", "ghosted", "rejected"]
  if (typeof data.status !== "string" || !validStatuses.includes(data.status)) {
    throw new Error("Invalid status.")
  }
  if (typeof data.appliedDate !== "string" || isNaN(Date.parse(data.appliedDate))) {
    throw new Error("Invalid application date format.")
  }
  if (data.autoGhostDays !== undefined && data.autoGhostDays !== null) {
    if (typeof data.autoGhostDays !== "number" || isNaN(data.autoGhostDays) || data.autoGhostDays < 7 || data.autoGhostDays > 365) {
      throw new Error("Invalid autoGhostDays. Must be an integer between 7 and 365.")
    }
  }
  if (data.contactEmail !== undefined && data.contactEmail !== null && data.contactEmail !== "") {
    if (typeof data.contactEmail !== "string" || data.contactEmail.length > 255 || !data.contactEmail.includes("@")) {
      throw new Error("Invalid contact email format.")
    }
  }
  if (data.notes !== undefined && data.notes !== null) {
    if (typeof data.notes !== "string" || data.notes.length > 10000) {
      throw new Error("Invalid notes. Maximum length is 10,000 characters.")
    }
  }

  const autoGhostDays = data.autoGhostDays !== undefined ? Math.max(7, data.autoGhostDays) : 14

  const job = await db.job.create({
    data: {
      company: data.company,
      role: data.role,
      platform: data.platform,
      status: data.status,
      appliedDate: new Date(data.appliedDate),
      notes: data.notes,
      autoGhostDays: autoGhostDays,
      userId: session.user.id,
      contactEmail: data.contactEmail,
      interactionCount: 1,
      lastInteractionAt: new Date(),
    },
  })

  revalidatePath("/dashboard")
  return job
}

export async function getJobsAction(options?: {
  page?: number
  limit?: number
  search?: string
  statusFilter?: string
  sortOrder?: "asc" | "desc"
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      jobs: [],
      hasMore: false,
      totalCount: 0,
      stats: {
        applied: 0,
        ongoing: 0,
        ghosted: 0,
        rejected: 0,
      },
    }
  }

  // Server-side input validation
  if (options) {
    if (options.page !== undefined) {
      if (typeof options.page !== "number" || isNaN(options.page) || options.page < 1) {
        throw new Error("Invalid page number.")
      }
    }
    if (options.limit !== undefined) {
      if (typeof options.limit !== "number" || isNaN(options.limit) || options.limit < 1 || options.limit > 100) {
        throw new Error("Invalid limit.")
      }
    }
    if (options.search !== undefined) {
      if (typeof options.search !== "string" || options.search.length > 100) {
        throw new Error("Search query must be under 100 characters.")
      }
    }
    if (options.statusFilter !== undefined) {
      const validFilters = ["all", "applied", "ongoing", "ghosted", "rejected"]
      if (typeof options.statusFilter !== "string" || !validFilters.includes(options.statusFilter)) {
        throw new Error("Invalid status filter.")
      }
    }
    if (options.sortOrder !== undefined) {
      if (options.sortOrder !== "asc" && options.sortOrder !== "desc") {
        throw new Error("Invalid sort order.")
      }
    }
  }

  // Auto-ghost stale active applications in the database
  try {
    const now = new Date()
    const activeJobs = await db.job.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["applied", "ongoing"] },
      },
    })

    const staleJobIds: string[] = []
    for (const job of activeJobs) {
      const appliedDate = new Date(job.appliedDate)
      const diffTime = now.getTime() - appliedDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const threshold = Math.max(7, job.autoGhostDays)

      if (diffDays > threshold) {
        staleJobIds.push(job.id)
      }
    }

    if (staleJobIds.length > 0) {
      await db.job.updateMany({
        where: {
          id: { in: staleJobIds },
        },
        data: {
          status: "ghosted",
        },
      })
    }
  } catch (error) {
    console.error("Failed to auto-ghost active jobs in getJobsAction:", error)
  }

  // Get total stats (after auto-ghosting)
  const [appliedCount, ongoingCount, ghostedCount, rejectedCount] = await Promise.all([
    db.job.count({ where: { userId: session.user.id } }),
    db.job.count({ where: { userId: session.user.id, status: "ongoing" } }),
    db.job.count({ where: { userId: session.user.id, status: "ghosted" } }),
    db.job.count({ where: { userId: session.user.id, status: "rejected" } }),
  ])

  // Build filters
  const page = options?.page || 1
  const limit = options?.limit || 15
  const search = options?.search || ""
  const statusFilter = options?.statusFilter || "all"
  const sortOrder = options?.sortOrder || "desc"

  const whereClause: Prisma.JobWhereInput = {
    userId: session.user.id,
  }

  if (search) {
    whereClause.OR = [
      { company: { contains: search, mode: "insensitive" } },
      { role: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ]
  }

  if (statusFilter !== "all") {
    whereClause.status = statusFilter
  }

  const skip = (page - 1) * limit

  const totalFilteredCount = await db.job.count({ where: whereClause })

  const jobs = await db.job.findMany({
    where: whereClause,
    include: {
      interactions: {
        orderBy: {
          date: "desc",
        },
      },
    },
    orderBy: {
      appliedDate: sortOrder,
    },
    skip,
    take: limit,
  })

  const mappedJobs = jobs.map(job => ({
    id: job.id,
    company: job.company,
    role: job.role,
    platform: job.platform,
    status: job.status as JobStatus,
    appliedDate: job.appliedDate.toISOString().split("T")[0],
    notes: job.notes || "",
    autoGhostDays: job.autoGhostDays,
    interactionCount: job.interactionCount,
    lastInteractionAt: job.lastInteractionAt.toISOString(),
    contactEmail: job.contactEmail,
    processedMessageIds: job.processedMessageIds,
    threadId: job.threadId,
    interactions: job.interactions.map(i => ({
      id: i.id,
      messageId: i.messageId,
      subject: i.subject,
      date: i.date.toISOString(),
    })),
  })) as Job[]

  const hasMore = skip + jobs.length < totalFilteredCount

  return {
    jobs: mappedJobs,
    hasMore,
    totalCount: totalFilteredCount,
    stats: {
      applied: appliedCount,
      ongoing: ongoingCount,
      ghosted: ghostedCount,
      rejected: rejectedCount,
    }
  }
}

export async function updateJobAction(id: string, data: Partial<Job>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Validate id
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Invalid job ID.")
  }

  // Validate any fields present in data
  if (data.company !== undefined) {
    if (typeof data.company !== "string" || !data.company.trim() || data.company.length > 200) {
      throw new Error("Invalid company name. Must be between 1 and 200 characters.")
    }
  }
  if (data.role !== undefined) {
    if (typeof data.role !== "string" || !data.role.trim() || data.role.length > 200) {
      throw new Error("Invalid role name. Must be between 1 and 200 characters.")
    }
  }
  if (data.platform !== undefined) {
    if (typeof data.platform !== "string" || !data.platform.trim() || data.platform.length > 100) {
      throw new Error("Invalid platform name. Must be between 1 and 100 characters.")
    }
  }
  if (data.status !== undefined) {
    const validStatuses = ["applied", "ongoing", "ghosted", "rejected"]
    if (typeof data.status !== "string" || !validStatuses.includes(data.status)) {
      throw new Error("Invalid status.")
    }
  }
  if (data.appliedDate !== undefined) {
    if (typeof data.appliedDate !== "string" || isNaN(Date.parse(data.appliedDate))) {
      throw new Error("Invalid application date format.")
    }
  }
  if (data.autoGhostDays !== undefined) {
    if (typeof data.autoGhostDays !== "number" || isNaN(data.autoGhostDays) || data.autoGhostDays < 7 || data.autoGhostDays > 365) {
      throw new Error("Invalid autoGhostDays. Must be an integer between 7 and 365.")
    }
  }
  if (data.contactEmail !== undefined && data.contactEmail !== null && data.contactEmail !== "") {
    if (typeof data.contactEmail !== "string" || data.contactEmail.length > 255 || !data.contactEmail.includes("@")) {
      throw new Error("Invalid contact email format.")
    }
  }
  if (data.notes !== undefined && data.notes !== null) {
    if (typeof data.notes !== "string" || data.notes.length > 10000) {
      throw new Error("Invalid notes. Maximum length is 10,000 characters.")
    }
  }
  if (data.threadId !== undefined && data.threadId !== null) {
    if (typeof data.threadId !== "string" || data.threadId.length > 255) {
      throw new Error("Invalid thread ID.")
    }
  }
  if (data.interactionCount !== undefined) {
    if (typeof data.interactionCount !== "number" || isNaN(data.interactionCount) || data.interactionCount < 0) {
      throw new Error("Invalid interaction count.")
    }
  }
  if (data.lastInteractionAt !== undefined) {
    if (typeof data.lastInteractionAt !== "string" || isNaN(Date.parse(data.lastInteractionAt))) {
      throw new Error("Invalid last interaction date format.")
    }
  }

  const job = await db.job.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      company: data.company,
      role: data.role,
      platform: data.platform,
      status: data.status,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : undefined,
      notes: data.notes,
      autoGhostDays: data.autoGhostDays !== undefined ? Math.max(7, data.autoGhostDays) : undefined,
      interactionCount: data.interactionCount,
      lastInteractionAt: data.lastInteractionAt ? new Date(data.lastInteractionAt) : undefined,
      contactEmail: data.contactEmail,
      threadId: data.threadId,
    },
  })

  revalidatePath("/dashboard")
  return job
}

export async function deleteJobAction(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Validate id
  if (typeof id !== "string" || !id.trim()) {
    throw new Error("Invalid job ID.")
  }

  // 1. Fetch the job to get its processedMessageIds, threadId, and status
  const job = await db.job.findUnique({
    where: { id, userId: session.user.id },
    select: { id: true, processedMessageIds: true, threadId: true, status: true }
  })

  if (!job) {
    console.warn(`Delete: Job ${id} not found or already deleted.`);
    return;
  }

  const isTerminalState = job.status === "rejected" || job.status === "ghosted";

  if (isTerminalState) {
    // For terminal states (e.g. rejected/ghosted), we want to make sure the emails
    // are NOT re-synced in the future if the user deletes the job from their dashboard.
    
    // Mark the thread as ignored so no other messages in this conversation re-trigger a sync
    if (job.threadId && db.ignoredThread) {
      await db.ignoredThread.upsert({
        where: { userId_threadId: { userId: session.user.id!, threadId: job.threadId } },
        update: {},
        create: { userId: session.user.id!, threadId: job.threadId }
      })
    }

    if (job.processedMessageIds.length > 0 && db.processedEmail) {
      const userId = session.user.id!
      await Promise.all(
        job.processedMessageIds.map(messageId => 
          db.processedEmail.upsert({
            where: { userId_messageId: { userId, messageId } },
            update: {},
            create: { userId, messageId }
          })
        )
      )
    }
  } else {
    // For active states (applied/ongoing), we want to delete these from ignored/processed lists
    // so that the email synchronization will be able to pick them up again if needed.
    if (job.threadId && db.ignoredThread) {
      await db.ignoredThread.deleteMany({
        where: {
          userId: session.user.id!,
          threadId: job.threadId
        }
      })
    }

    if (job.processedMessageIds.length > 0 && db.processedEmail) {
      await db.processedEmail.deleteMany({
        where: {
          userId: session.user.id!,
          messageId: { in: job.processedMessageIds }
        }
      })
    }
  }

  // 3. Delete the job
  await db.job.delete({
    where: {
      id: job.id,
      userId: session.user.id,
    },
  })

  revalidatePath("/dashboard")
}

export async function deleteAllJobsAction() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Delete all jobs of the user (Cascade delete handles EmailInteractions)
  await db.job.deleteMany({
    where: {
      userId: session.user.id,
    },
  })

  // Delete ignored threads
  await db.ignoredThread.deleteMany({
    where: {
      userId: session.user.id,
    },
  })

  // Delete processed email tracking history
  await db.processedEmail.deleteMany({
    where: {
      userId: session.user.id,
    },
  })

  revalidatePath("/dashboard")
}
