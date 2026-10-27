/*
  Warnings:

  - You are about to drop the column `carreraId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dni]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_carreraId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "carreraId",
ADD COLUMN     "dni" TEXT;

-- CreateTable
CREATE TABLE "UserCarrera" (
    "userId" TEXT NOT NULL,
    "carreraId" TEXT NOT NULL,

    CONSTRAINT "UserCarrera_pkey" PRIMARY KEY ("userId","carreraId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");

-- AddForeignKey
ALTER TABLE "UserCarrera" ADD CONSTRAINT "UserCarrera_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCarrera" ADD CONSTRAINT "UserCarrera_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE CASCADE ON UPDATE CASCADE;
