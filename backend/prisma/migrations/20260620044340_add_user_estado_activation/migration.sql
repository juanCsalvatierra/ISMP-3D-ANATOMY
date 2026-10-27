/*
  Warnings:

  - A unique constraint covering the columns `[activationCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('PENDIENTE', 'ACTIVO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activationCode" TEXT,
ADD COLUMN     "estado" "EstadoUsuario" NOT NULL DEFAULT 'PENDIENTE';

-- CreateIndex
CREATE UNIQUE INDEX "User_activationCode_key" ON "User"("activationCode");
