/*
  Warnings:

  - Added the required column `bystanderName` to the `BloodRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bystanderPhone` to the `BloodRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BloodRequest" DROP CONSTRAINT "BloodRequest_requesterId_fkey";

-- AlterTable
ALTER TABLE "BloodRequest" ADD COLUMN     "bystanderName" TEXT NOT NULL,
ADD COLUMN     "bystanderPhone" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "BloodRequest_requesterId_idx" ON "BloodRequest"("requesterId");

-- AddForeignKey
ALTER TABLE "BloodRequest" ADD CONSTRAINT "BloodRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
