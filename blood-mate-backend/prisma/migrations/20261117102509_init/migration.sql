/*
  Warnings:

  - You are about to drop the column `whatsapp` on the `Student` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Student_whatsapp_idx";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "whatsapp";
