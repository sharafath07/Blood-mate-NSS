BEGIN;

-- CreateEnum
CREATE TYPE "RequestUrgency" AS ENUM ('NORMAL', 'URGENT', 'CRITICAL');

-- AlterTable
ALTER TABLE "BloodRequest" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "urgency" "RequestUrgency" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "DonorResponse" ADD COLUMN     "donatedUnits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DonorContact" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "recordedBy" TEXT,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonorContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DonorContact_donorId_idx" ON "DonorContact"("donorId");

-- CreateIndex
CREATE INDEX "DonorContact_recordedBy_idx" ON "DonorContact"("recordedBy");

-- CreateIndex
CREATE INDEX "DonorContact_createdAt_idx" ON "DonorContact"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DonorContact_requestId_donorId_key" ON "DonorContact"("requestId", "donorId");

-- AddForeignKey
ALTER TABLE "DonorContact" ADD CONSTRAINT "DonorContact_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BloodRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorContact" ADD CONSTRAINT "DonorContact_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorContact" ADD CONSTRAINT "DonorContact_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DonorResponse" ADD CONSTRAINT "DonorResponse_donatedUnits_check" CHECK ("donatedUnits" >= 0);

COMMIT;
