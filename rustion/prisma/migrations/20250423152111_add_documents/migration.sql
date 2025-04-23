-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER,
ALTER COLUMN "content" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");
