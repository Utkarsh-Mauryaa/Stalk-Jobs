import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Check authorization if a CRON_SECRET is set in the environment
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const activeJobs = await db.job.findMany({
      where: {
        status: { in: ["applied", "ongoing"] },
      },
    });

    const staleJobIds: string[] = [];
    for (const job of activeJobs) {
      const appliedDate = new Date(job.appliedDate);
      const diffTime = now.getTime() - appliedDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const threshold = Math.max(7, job.autoGhostDays);

      if (diffDays > threshold) {
        staleJobIds.push(job.id);
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
      });
    }

    return NextResponse.json({
      success: true,
      updatedCount: staleJobIds.length,
      message: `Successfully updated ${staleJobIds.length} stale job applications to 'ghosted'.`,
    });
  } catch (error: unknown) {
    console.error("Auto-ghost CRON task failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// Support GET for testing or simple cron trigger providers
export async function GET(req: Request) {
  return POST(req);
}
