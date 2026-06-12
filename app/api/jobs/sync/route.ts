import { auth } from "@/auth";
import { syncGmailJobs } from "@/lib/gmail-service";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await syncGmailJobs(session.user.id);
    return NextResponse.json({ 
      success: true, 
      count: jobs.length,
      jobs: jobs 
    });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to sync jobs" 
    }, { status: 500 });
  }
}
