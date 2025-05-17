/*
  Warnings:

  - You are about to drop the column `pinned` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "pinned",
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;
