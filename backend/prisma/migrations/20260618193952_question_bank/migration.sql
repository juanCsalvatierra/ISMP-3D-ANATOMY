/*
  Warnings:

  - You are about to drop the column `formato` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `materiaSlug` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `cuestionarioId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `orden` on the `Question` table. All the data in the column will be lost.
  - Added the required column `correctSnapshot` to the `AnswerLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `textoSnapshot` to the `AnswerLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cantidad` to the `Cuestionario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `autorId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formato` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_cuestionarioId_fkey";

-- AlterTable
ALTER TABLE "AnswerLog" ADD COLUMN     "correctSnapshot" INTEGER NOT NULL,
ADD COLUMN     "opcionesSnapshot" TEXT[],
ADD COLUMN     "textoSnapshot" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Attempt" DROP COLUMN "formato",
DROP COLUMN "materiaSlug";

-- AlterTable
ALTER TABLE "Cuestionario" ADD COLUMN     "cantidad" INTEGER NOT NULL,
ADD COLUMN     "unidad" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "cuestionarioId",
DROP COLUMN "orden",
ADD COLUMN     "autorId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "formato" "Formato" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "QuestionMateria" (
    "questionId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "unidad" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuestionMateria_pkey" PRIMARY KEY ("questionId","materiaId")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMateria" ADD CONSTRAINT "QuestionMateria_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMateria" ADD CONSTRAINT "QuestionMateria_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerLog" ADD CONSTRAINT "AnswerLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
