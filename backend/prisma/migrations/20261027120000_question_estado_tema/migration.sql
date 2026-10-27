-- CreateEnum
CREATE TYPE "EstadoPregunta" AS ENUM ('BORRADOR', 'APROBADA');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "aprobadaAt" TIMESTAMP(3),
ADD COLUMN     "aprobadaPorId" TEXT,
ADD COLUMN     "estado" "EstadoPregunta" NOT NULL DEFAULT 'APROBADA',
ADD COLUMN     "tema" TEXT;

-- CreateIndex
CREATE INDEX "Question_estado_idx" ON "Question"("estado");

-- CreateIndex
CREATE INDEX "Question_tema_idx" ON "Question"("tema");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_aprobadaPorId_fkey" FOREIGN KEY ("aprobadaPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

