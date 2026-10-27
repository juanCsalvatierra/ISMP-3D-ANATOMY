/*
  Warnings:

  - You are about to drop the column `cuestionarioId` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the `Cuestionario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cantidad` to the `Attempt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attempt" DROP CONSTRAINT "Attempt_cuestionarioId_fkey";

-- DropForeignKey
ALTER TABLE "Cuestionario" DROP CONSTRAINT "Cuestionario_autorId_fkey";

-- DropForeignKey
ALTER TABLE "Cuestionario" DROP CONSTRAINT "Cuestionario_materiaId_fkey";

-- AlterTable
ALTER TABLE "Attempt" DROP COLUMN "cuestionarioId",
ADD COLUMN     "cantidad" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Cuestionario";
