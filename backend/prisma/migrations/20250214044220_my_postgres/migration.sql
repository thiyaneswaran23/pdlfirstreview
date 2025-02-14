/*
  Warnings:

  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "bmi" DOUBLE PRECISION,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "goal" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "injuries" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION,
ALTER COLUMN "password" SET NOT NULL;
