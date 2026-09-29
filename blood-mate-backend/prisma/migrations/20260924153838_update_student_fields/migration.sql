/*
  Warnings:

  - You are about to drop the column `batch` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Student` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WeightCategory" AS ENUM ('ABOVE_45_KG', 'BELOW_45_KG');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- DropIndex
DROP INDEX "Student_studentId_key";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "batch",
DROP COLUMN "email",
DROP COLUMN "studentId",
ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "weightCategory" "WeightCategory",
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "willingToDonate" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Student_whatsapp_idx" ON "Student"("whatsapp");

-- CreateIndex
CREATE INDEX "Student_department_idx" ON "Student"("department");
