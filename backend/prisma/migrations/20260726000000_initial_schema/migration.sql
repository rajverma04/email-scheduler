-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED', 'RETRYING');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sender" (
    "id" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "smtpHost" TEXT NOT NULL,
    "smtpPort" INTEGER NOT NULL,
    "smtpUser" TEXT NOT NULL,
    "smtpPassword" TEXT NOT NULL,
    "hourlyLimit" INTEGER NOT NULL,
    "dailyLimit" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Sender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSchedule" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "EmailStatus" NOT NULL,
    "bullJobId" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "failureReason" TEXT,
    "providerMessageId" TEXT,
    "delayBetweenEmails" INTEGER NOT NULL,
    "hourlyLimit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailRetry" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "error" TEXT NOT NULL,
    "retryTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailRetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailOutbox" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "claimedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "EmailSchedule_bullJobId_key" ON "EmailSchedule"("bullJobId");
CREATE INDEX "EmailSchedule_senderId_status_scheduledAt_idx" ON "EmailSchedule"("senderId", "status", "scheduledAt");
CREATE UNIQUE INDEX "EmailOutbox_emailId_key" ON "EmailOutbox"("emailId");
CREATE INDEX "EmailOutbox_status_claimedAt_idx" ON "EmailOutbox"("status", "claimedAt");

-- AddForeignKey
ALTER TABLE "Sender" ADD CONSTRAINT "Sender_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmailSchedule" ADD CONSTRAINT "EmailSchedule_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Sender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmailRetry" ADD CONSTRAINT "EmailRetry_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "EmailSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmailOutbox" ADD CONSTRAINT "EmailOutbox_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "EmailSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
