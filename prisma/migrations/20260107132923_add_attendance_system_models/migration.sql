-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "attendance_status" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "wfh_request_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "daily_report_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'REMINDER');

-- CreateEnum
CREATE TYPE "security_action_type" AS ENUM ('LOGIN_ATTEMPT', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS', 'PASSWORD_CHANGE', 'TOKEN_REFRESH', 'API_KEY_USED', 'API_KEY_ROTATED', 'API_KEY_INVALIDATED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "user_role" ADD VALUE 'MANAGER';
ALTER TYPE "user_role" ADD VALUE 'HR';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "contact" VARCHAR(50),
ADD COLUMN     "department" VARCHAR(100),
ADD COLUMN     "emailVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "status" "user_status" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3) NOT NULL,
    "checkOutTime" TIMESTAMP(3),
    "checkInLocation" VARCHAR(255),
    "checkOutLocation" VARCHAR(255),
    "checkInLat" DOUBLE PRECISION,
    "checkInLng" DOUBLE PRECISION,
    "checkOutLat" DOUBLE PRECISION,
    "checkOutLng" DOUBLE PRECISION,
    "status" "attendance_status" NOT NULL DEFAULT 'PRESENT',
    "workFromHome" BOOLEAN NOT NULL DEFAULT false,
    "lateArrival" BOOLEAN NOT NULL DEFAULT false,
    "missingCheckout" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wfh_request" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "wfh_request_status" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "wfh_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "status" "daily_report_status" NOT NULL DEFAULT 'PENDING',
    "hrFeedback" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "daily_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachment" (
    "id" TEXT NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "filePath" VARCHAR(500) NOT NULL,
    "fileType" VARCHAR(50) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "wfhRequestId" TEXT,
    "dailyReportId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "notification_type" NOT NULL DEFAULT 'INFO',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "description" VARCHAR(255),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "workspace_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "permission" VARCHAR(100) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(100),
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "security_action_type" NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(255),
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkpoint" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "location" VARCHAR(255),
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255),
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_userId_idx" ON "attendance"("userId");

-- CreateIndex
CREATE INDEX "attendance_checkInTime_idx" ON "attendance"("checkInTime");

-- CreateIndex
CREATE INDEX "attendance_status_idx" ON "attendance"("status");

-- CreateIndex
CREATE INDEX "attendance_workFromHome_idx" ON "attendance"("workFromHome");

-- CreateIndex
CREATE INDEX "wfh_request_userId_idx" ON "wfh_request"("userId");

-- CreateIndex
CREATE INDEX "wfh_request_date_idx" ON "wfh_request"("date");

-- CreateIndex
CREATE INDEX "wfh_request_status_idx" ON "wfh_request"("status");

-- CreateIndex
CREATE INDEX "daily_report_userId_idx" ON "daily_report"("userId");

-- CreateIndex
CREATE INDEX "daily_report_date_idx" ON "daily_report"("date");

-- CreateIndex
CREATE INDEX "daily_report_status_idx" ON "daily_report"("status");

-- CreateIndex
CREATE INDEX "attachment_wfhRequestId_idx" ON "attachment"("wfhRequestId");

-- CreateIndex
CREATE INDEX "attachment_dailyReportId_idx" ON "attachment"("dailyReportId");

-- CreateIndex
CREATE INDEX "notification_userId_idx" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "notification_read_idx" ON "notification"("read");

-- CreateIndex
CREATE INDEX "notification_createdAt_idx" ON "notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_settings_key_key" ON "workspace_settings"("key");

-- CreateIndex
CREATE INDEX "workspace_settings_key_idx" ON "workspace_settings"("key");

-- CreateIndex
CREATE INDEX "role_permission_role_idx" ON "role_permission"("role");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_role_permission_key" ON "role_permission"("role", "permission");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "audit_log"("userId");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "audit_log_resource_resourceId_idx" ON "audit_log"("resource", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_key_key" ON "api_key"("key");

-- CreateIndex
CREATE INDEX "api_key_key_idx" ON "api_key"("key");

-- CreateIndex
CREATE INDEX "api_key_active_idx" ON "api_key"("active");

-- CreateIndex
CREATE INDEX "security_activity_userId_idx" ON "security_activity"("userId");

-- CreateIndex
CREATE INDEX "security_activity_action_idx" ON "security_activity"("action");

-- CreateIndex
CREATE INDEX "security_activity_success_idx" ON "security_activity"("success");

-- CreateIndex
CREATE INDEX "security_activity_createdAt_idx" ON "security_activity"("createdAt");

-- CreateIndex
CREATE INDEX "checkpoint_active_idx" ON "checkpoint"("active");

-- CreateIndex
CREATE INDEX "location_active_idx" ON "location"("active");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_department_idx" ON "user"("department");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wfh_request" ADD CONSTRAINT "wfh_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wfh_request" ADD CONSTRAINT "wfh_request_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_report" ADD CONSTRAINT "daily_report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_wfhRequestId_fkey" FOREIGN KEY ("wfhRequestId") REFERENCES "wfh_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_dailyReportId_fkey" FOREIGN KEY ("dailyReportId") REFERENCES "daily_report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
