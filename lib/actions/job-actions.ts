"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Job, Socials } from "@/types/job"

export async function addJobAction(data: {
  company: string
  role: string
  platform: string
  status: string
  appliedDate: string
  notes?: string
  socials?: Socials
  autoGhostDays?: number
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

  const jobs = await db.job.findMany({
    where: {
      userId: session.user.id,
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
    status: job.status as any,
    appliedDate: job.appliedDate.toISOString().split("T")[0],
    notes: job.notes || "",
    socials: (job.socials as unknown as Socials) || { linkedin: "", email: "", x: "" },
    autoGhostDays: job.autoGhostDays,
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

  await db.job.delete({
    where: {
      id,
      userId: session.user.id,
    },
  })

  revalidatePath("/dashboard")
}
