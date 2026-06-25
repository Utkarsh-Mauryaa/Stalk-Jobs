"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function deleteUserAccountAction() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Cascade deletes will automatically clean up all associated:
  // accounts, sessions, jobs, email interactions, processed emails, and ignored threads.
  await db.user.delete({
    where: {
      id: session.user.id,
    },
  })

  return { success: true }
}
