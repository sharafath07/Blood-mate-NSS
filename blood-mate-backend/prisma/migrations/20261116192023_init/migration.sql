/*
  Warnings:

  - You are about to drop the column `requesterId` on the `BloodRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BloodRequest" DROP CONSTRAINT "BloodRequest_requesterId_fkey";

-- DropIndex
DROP INDEX "BloodRequest_requesterId_idx";

-- AlterTable
ALTER TABLE "BloodRequest" DROP COLUMN "requesterId";
