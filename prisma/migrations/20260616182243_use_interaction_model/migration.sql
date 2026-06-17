/*
  Warnings:

  - You are about to drop the column `email_history` on the `jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "email_history";

-- CreateTable
CREATE TABLE "email_interactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "job_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_interactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "email_interactions" ADD CONSTRAINT "email_interactions_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
