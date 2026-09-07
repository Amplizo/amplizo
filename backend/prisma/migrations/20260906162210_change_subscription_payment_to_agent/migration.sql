/*
  Warnings:

  - You are about to drop the column `clientId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `agentId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agentId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_clientId_fkey";

-- DropIndex
DROP INDEX "Payment_clientId_idx";

-- DropIndex
DROP INDEX "Subscription_clientId_idx";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "clientId",
ADD COLUMN     "agentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "clientId",
ADD COLUMN     "agentId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Payment_agentId_idx" ON "Payment"("agentId");

-- CreateIndex
CREATE INDEX "Subscription_agentId_idx" ON "Subscription"("agentId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
