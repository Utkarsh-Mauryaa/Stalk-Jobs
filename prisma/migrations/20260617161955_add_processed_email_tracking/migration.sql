-- CreateTable
CREATE TABLE "processed_emails" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "processed_emails_user_id_message_id_key" ON "processed_emails"("user_id", "message_id");

-- AddForeignKey
ALTER TABLE "processed_emails" ADD CONSTRAINT "processed_emails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
