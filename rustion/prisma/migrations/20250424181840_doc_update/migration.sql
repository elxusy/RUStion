/*
  Warnings:

  - You are about to drop the column `isPinned` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "isPinned",
ADD COLUMN     "blocksContent" TEXT,
ADD COLUMN     "isUsingBlocks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "textContent" TEXT;
