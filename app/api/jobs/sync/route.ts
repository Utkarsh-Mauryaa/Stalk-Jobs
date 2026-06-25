import { auth } from "@/auth";
import { syncGmailJobs } from "@/lib/gmail-service";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await syncGmailJobs(session.user.id);
    
    // Revalidate the dashboard path so fresh data is fetched
    revalidatePath("/dashboard");
    
    return NextResponse.json({ 
      success: true, 
      count: jobs.length,
      jobs: jobs 
    });
  } catch (error: unknown) {
    console.error("Sync Error:", error);
    const isProd = process.env.NODE_ENV === "production";
    const errorMessage = isProd
      ? "Failed to sync jobs"
      : (error instanceof Error ? error.message : "Failed to sync jobs");
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
