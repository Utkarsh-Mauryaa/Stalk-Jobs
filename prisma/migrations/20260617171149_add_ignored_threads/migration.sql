-- CreateTable
CREATE TABLE "ignored_threads" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ignored_threads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ignored_threads_user_id_thread_id_key" ON "ignored_threads"("user_id", "thread_id");

-- AddForeignKey
ALTER TABLE "ignored_threads" ADD CONSTRAINT "ignored_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
