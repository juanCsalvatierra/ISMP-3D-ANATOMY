-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOCENTE', 'ESTUDIANTE');

-- CreateEnum
CREATE TYPE "Formato" AS ENUM ('MULTIPLE', 'TRUEFALSE', 'IDENTIFICATION', 'LABELING');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "carreraId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrera" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Carrera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuestionario" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "materiaId" TEXT NOT NULL,
    "formato" "Formato" NOT NULL,
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cuestionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "cuestionarioId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "opciones" TEXT[],
    "correct" INTEGER NOT NULL,
    "explicacion" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "cuestionarioId" TEXT NOT NULL,
    "materiaSlug" TEXT NOT NULL,
    "formato" "Formato" NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerLog" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selected" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,

    CONSTRAINT "AnswerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CarreraMaterias" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CarreraMaterias_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Carrera_slug_key" ON "Carrera"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Materia_slug_key" ON "Materia"("slug");

-- CreateIndex
CREATE INDEX "_CarreraMaterias_B_index" ON "_CarreraMaterias"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_carreraId_fkey" FOREIGN KEY ("carreraId") REFERENCES "Carrera"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuestionario" ADD CONSTRAINT "Cuestionario_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuestionario" ADD CONSTRAINT "Cuestionario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_cuestionarioId_fkey" FOREIGN KEY ("cuestionarioId") REFERENCES "Cuestionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_cuestionarioId_fkey" FOREIGN KEY ("cuestionarioId") REFERENCES "Cuestionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerLog" ADD CONSTRAINT "AnswerLog_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarreraMaterias" ADD CONSTRAINT "_CarreraMaterias_A_fkey" FOREIGN KEY ("A") REFERENCES "Carrera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarreraMaterias" ADD CONSTRAINT "_CarreraMaterias_B_fkey" FOREIGN KEY ("B") REFERENCES "Materia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
