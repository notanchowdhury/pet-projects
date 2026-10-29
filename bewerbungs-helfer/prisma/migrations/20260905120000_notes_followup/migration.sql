-- AlterTable
ALTER TABLE "Application" ADD COLUMN "notes" TEXT;
ALTER TABLE "Application" ADD COLUMN "followUpAt" DATETIME;

-- CreateIndex
CREATE INDEX "Application_userId_status_idx" ON "Application"("userId", "status");

-- CreateIndex
CREATE INDEX "Application_userId_createdAt_idx" ON "Application"("userId", "createdAt");
