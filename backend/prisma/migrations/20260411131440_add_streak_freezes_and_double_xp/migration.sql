-- AlterTable
ALTER TABLE "User" ADD COLUMN     "doubleXpUntil" TIMESTAMP(3),
ADD COLUMN     "streakFreezes" INTEGER NOT NULL DEFAULT 0;
