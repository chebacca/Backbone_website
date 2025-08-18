-- CreateEnum for demo mode
CREATE TYPE "DemoStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CONVERTED', 'ABANDONED');

-- CreateEnum for demo conversion source tracking
CREATE TYPE "DemoConversionSource" AS ENUM ('COUNTDOWN_TIMER', 'FEATURE_RESTRICTION', 'UPGRADE_PROMPT', 'EMAIL_CAMPAIGN', 'MANUAL');

-- AlterEnum - Add demo statuses to SubscriptionStatus
ALTER TYPE "SubscriptionStatus" ADD VALUE 'DEMO_ACTIVE';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'DEMO_EXPIRED';

-- AlterTable - Add demo mode fields to User table
ALTER TABLE "User" ADD COLUMN     "isDemoUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "demoStartedAt" TIMESTAMP(3),
ADD COLUMN     "demoExpiresAt" TIMESTAMP(3),
ADD COLUMN     "demoStatus" "DemoStatus",
ADD COLUMN     "demoTier" "SubscriptionTier",
ADD COLUMN     "demoFeatureAccess" JSONB,
ADD COLUMN     "demoConvertedAt" TIMESTAMP(3),
ADD COLUMN     "demoConversionSource" "DemoConversionSource",
ADD COLUMN     "demoSessionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "demoLastActivityAt" TIMESTAMP(3),
ADD COLUMN     "demoRemindersSent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "demoAppUsageMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "demoFeaturesUsed" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable - Demo session tracking
CREATE TABLE "DemoSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "DemoStatus" NOT NULL DEFAULT 'ACTIVE',
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'BASIC',
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "featuresAccessed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "restrictionsHit" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "upgradePromptShown" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversionAttempts" INTEGER NOT NULL DEFAULT 0,
    "emailRemindersSent" INTEGER NOT NULL DEFAULT 0,
    "deviceInfo" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referralSource" TEXT,
    "utmSource" TEXT,
    "utmCampaign" TEXT,
    "utmMedium" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable - Demo activity tracking
CREATE TABLE "DemoActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "demoSessionId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "featureName" TEXT,
    "restrictionType" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DemoSession_sessionId_key" ON "DemoSession"("sessionId");

-- CreateIndex
CREATE INDEX "DemoSession_userId_idx" ON "DemoSession"("userId");

-- CreateIndex
CREATE INDEX "DemoSession_status_expiresAt_idx" ON "DemoSession"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "DemoSession_createdAt_idx" ON "DemoSession"("createdAt");

-- CreateIndex
CREATE INDEX "DemoActivity_userId_timestamp_idx" ON "DemoActivity"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "DemoActivity_demoSessionId_timestamp_idx" ON "DemoActivity"("demoSessionId", "timestamp");

-- CreateIndex
CREATE INDEX "DemoActivity_activityType_timestamp_idx" ON "DemoActivity"("activityType", "timestamp");

-- AddForeignKey
ALTER TABLE "DemoSession" ADD CONSTRAINT "DemoSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoActivity" ADD CONSTRAINT "DemoActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoActivity" ADD CONSTRAINT "DemoActivity_demoSessionId_fkey" FOREIGN KEY ("demoSessionId") REFERENCES "DemoSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
