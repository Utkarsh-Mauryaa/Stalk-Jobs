import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Find the Google account for this user to get the access token
  const account = await db.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  })

  if (!account?.access_token) {
    return NextResponse.json({ connected: false, error: "No access token found" })
  }

  try {
    // Attempt a minimal Gmail API call to verify the token
    const response = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
        },
      }
    )

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ 
        connected: true, 
        email: data.emailAddress,
        messagesTotal: data.messagesTotal,
        scope: account.scope 
      })
    } else {
      const errorData = await response.json()
      return NextResponse.json({ 
        connected: false, 
        error: errorData.error?.message || "Failed to verify with Google",
        scope: account.scope
      }, { status: response.status })
    }
  } catch (error) {
    return NextResponse.json({ 
      connected: false, 
      error: "Network error while verifying connection" 
    }, { status: 500 })
  }
}
