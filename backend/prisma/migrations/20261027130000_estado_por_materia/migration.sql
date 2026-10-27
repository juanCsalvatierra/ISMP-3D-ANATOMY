-- La aprobación de una pregunta pasa a ser POR MATERIA (QuestionMateria): un docente
-- aprueba solo en las materias de sus carreras y el administrador en todas.
-- Se conserva lo ya cargado: cada fila del pivot hereda el estado de su pregunta.

-- AlterTable: columnas nuevas en el pivot
ALTER TABLE "QuestionMateria" ADD COLUMN     "aprobadaAt" TIMESTAMP(3),
ADD COLUMN     "aprobadaPorId" TEXT,
ADD COLUMN     "estado" "EstadoPregunta" NOT NULL DEFAULT 'APROBADA';

-- Backfill desde Question
UPDATE "QuestionMateria" AS qm
SET "estado"        = q."estado",
    "aprobadaAt"    = q."aprobadaAt",
    "aprobadaPorId" = q."aprobadaPorId"
FROM "Question" AS q
WHERE q."id" = qm."questionId";

-- AddForeignKey / CreateIndex en el pivot
ALTER TABLE "QuestionMateria" ADD CONSTRAINT "QuestionMateria_aprobadaPorId_fkey" FOREIGN KEY ("aprobadaPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "QuestionMateria_estado_idx" ON "QuestionMateria"("estado");

-- Question deja de tener estado propio
ALTER TABLE "Question" DROP CONSTRAINT "Question_aprobadaPorId_fkey";

DROP INDEX "Question_estado_idx";

ALTER TABLE "Question" DROP COLUMN "aprobadaAt",
DROP COLUMN "aprobadaPorId",
DROP COLUMN "estado";
