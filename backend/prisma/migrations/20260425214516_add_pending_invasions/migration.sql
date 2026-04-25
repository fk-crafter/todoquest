-- AlterTable
ALTER TABLE "User" ADD COLUMN     "monsterSenderName" TEXT;

-- CreateTable
CREATE TABLE "PendingInvasion" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingInvasion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PendingInvasion" ADD CONSTRAINT "PendingInvasion_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
