-- AlterTable
ALTER TABLE "User" ADD COLUMN     "monsterEndTime" TIMESTAMP(3),
ADD COLUMN     "monsterHp" INTEGER,
ADD COLUMN     "monsterMaxHp" INTEGER,
ADD COLUMN     "nextInvasionTime" TIMESTAMP(3);
