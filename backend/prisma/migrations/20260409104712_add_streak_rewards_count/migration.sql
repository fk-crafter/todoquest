-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastDailyRewardAt" TIMESTAMP(3),
ADD COLUMN     "streakCount" INTEGER NOT NULL DEFAULT 0;
