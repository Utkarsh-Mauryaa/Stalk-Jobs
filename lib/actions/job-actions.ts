"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Job, Socials, JobStatus } from "@/types/job"

export async function addJobAction(data: {
  company: string
  role: string
  platform: string
  status: string
  appliedDate: string
  notes?: string
  socials?: Socials
  autoGhostDays?: number
  contactEmail?: string | null
}) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
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
      socials: data.socials,
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

export async function getJobsAction() {
  const session = await auth()

  if (!session?.user?.id) {
    return []
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

  const jobs = await db.job.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      interactions: {
        orderBy: {
          date: "desc",
        },
      },
    },
    orderBy: {
      appliedDate: "desc",
    },
  })

  return jobs.map(job => ({
    id: job.id,
    company: job.company,
    role: job.role,
    platform: job.platform,
    status: job.status as JobStatus,
    appliedDate: job.appliedDate.toISOString().split("T")[0],
    notes: job.notes || "",
    socials: (job.socials as unknown as Socials) || { linkedin: "", email: "", x: "" },
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
}

export async function updateJobAction(id: string, data: Partial<Job>) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
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
      socials: data.socials,
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
