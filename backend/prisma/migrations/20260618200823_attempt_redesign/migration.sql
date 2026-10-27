/*
  Warnings:

  - You are about to drop the column `score` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Attempt` table. All the data in the column will be lost.
  - Added the required column `materiaId` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nota` to the `Attempt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attempt" DROP CONSTRAINT "Attempt_cuestionarioId_fkey";

-- AlterTable
ALTER TABLE "Attempt" DROP COLUMN "score",
DROP COLUMN "total",
ADD COLUMN     "materiaId" TEXT NOT NULL,
ADD COLUMN     "nota" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unidad" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "cuestionarioId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_cuestionarioId_fkey" FOREIGN KEY ("cuestionarioId") REFERENCES "Cuestionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
