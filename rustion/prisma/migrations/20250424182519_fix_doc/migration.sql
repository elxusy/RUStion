/*
  Warnings:

  - You are about to drop the column `blocksContent` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `isUsingBlocks` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `textContent` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "blocksContent",
DROP COLUMN "isUsingBlocks",
DROP COLUMN "textContent";
