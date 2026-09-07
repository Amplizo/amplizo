/*
  Warnings:

  - You are about to drop the column `otp` on the `OTP` table. All the data in the column will be lost.
  - Added the required column `otpHash` to the `OTP` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OTP" DROP COLUMN "otp",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "lastAttemptAt" TIMESTAMP(3),
ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "otpHash" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "WhatsAppMessage_whatsappMessageId_idx" ON "WhatsAppMessage"("whatsappMessageId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyTo_fkey" FOREIGN KEY ("replyTo") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
