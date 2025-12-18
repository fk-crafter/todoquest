-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EPIC');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'EASY';
