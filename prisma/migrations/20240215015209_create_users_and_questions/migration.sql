/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `questions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "questions" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3);
