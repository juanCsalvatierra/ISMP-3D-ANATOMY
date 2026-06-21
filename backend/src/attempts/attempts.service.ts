import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartAttemptDto } from './dto/start-attempt.dto';
import { AnswerAttemptDto } from './dto/answer-attempt.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Iniciar intento ─────────────────────────────────────────────────────
  async start(dto: StartAttemptDto, userId: string, role: Role, carreraIds: string[]) {
    const { materiaId, unidad, cantidad } = dto;

    if (role === Role.ESTUDIANTE && carreraIds.length > 0) {
      const materia = await this.prisma.materia.findFirst({
        where: { id: materiaId, carreras: { some: { id: { in: carreraIds } } } },
      });
      if (!materia) {
        throw new ForbiddenException('No tenés acceso a esa materia');
      }
    }

    const preguntas = await this.prisma.question.findMany({
      where: {
        materias: {
          some: {
            materiaId,
            ...(unidad > 0 ? { unidad } : {}),
          },
        },
      },
      select: {
        id:       true,
        texto:    true,
        opciones: true,
        formato:  true,
        correct:  true,
      },
    });

    if (preguntas.length === 0) {
      throw new BadRequestException('No hay preguntas disponibles para esta materia/unidad');
    }

    if (preguntas.length < cantidad) {
      throw new BadRequestException(
        `Solo hay ${preguntas.length} preguntas disponibles, se solicitaron ${cantidad}`,
      );
    }

    const shuffled      = [...preguntas].sort(() => Math.random() - 0.5);
    const seleccionadas = shuffled.slice(0, cantidad);

    const attempt = await this.prisma.attempt.create({
      data: {
        userId,
        materiaId,
        unidad,
        cantidad,
        attemptQuestions: {
          create: seleccionadas.map((p, index) => ({
            questionId: p.id,
            orden:      index,
          })),
        },
      },
    });

    const { correct, ...primeraPregunta } = seleccionadas[0];

    return {
      attemptId: attempt.id,
      total:     cantidad,
      numero:    1,
      pregunta:  primeraPregunta,
    };
  }

  // ─── Responder una pregunta ──────────────────────────────────────────────
  async answer(attemptId: string, dto: AnswerAttemptDto, userId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        attemptQuestions: { orderBy: { orden: 'asc' } },
        answerLogs:       true,
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Intento "${attemptId}" no encontrado`);
    }

    if (attempt.userId !== userId) {
      throw new BadRequestException('Este intento no te pertenece');
    }

    if (attempt.completado) {
      throw new ConflictException('Este intento ya fue completado');
    }

    const perteneceAlIntento = attempt.attemptQuestions.some(
      (aq) => aq.questionId === dto.questionId,
    );
    if (!perteneceAlIntento) {
      throw new BadRequestException('Esta pregunta no pertenece a este intento');
    }

    const yaRespondida = attempt.answerLogs.some(
      (al) => al.questionId === dto.questionId,
    );
    if (yaRespondida) {
      throw new ConflictException('Esta pregunta ya fue respondida');
    }

    const pregunta = await this.prisma.question.findUnique({
      where: { id: dto.questionId },
      select: {
        id:          true,
        texto:       true,
        opciones:    true,
        correct:     true,
        explicacion: true,
      },
    });

    if (!pregunta) {
      throw new NotFoundException(`Pregunta "${dto.questionId}" no encontrada`);
    }

    const esCorrecta = dto.selected === pregunta.correct;

    await this.prisma.answerLog.create({
      data: {
        attemptId,
        questionId:       dto.questionId,
        selected:         dto.selected,
        correct:          esCorrecta,
        textoSnapshot:    pregunta.texto,
        opcionesSnapshot: pregunta.opciones,
        correctSnapshot:  pregunta.correct,
      },
    });

    const totalRespondidas = attempt.answerLogs.length + 1;
    const totalPreguntas   = attempt.attemptQuestions.length;
    const esUltima         = totalRespondidas === totalPreguntas;

    if (esUltima) {
      const todosLogs = await this.prisma.answerLog.findMany({
        where: { attemptId },
      });

      const correctas = todosLogs.filter((l) => l.correct).length;
      const nota      = Math.round((correctas / totalPreguntas) * 100);

      await this.prisma.attempt.update({
        where: { id: attemptId },
        data:  { completado: true, completedAt: new Date(), nota },
      });

      return {
        tipo:        'finalizado',
        correcta:    esCorrecta,
        correcta_era: pregunta.correct,
        explicacion: pregunta.explicacion,
        resultado: {
          nota,
          correctas,
          total: totalPreguntas,
        },
      };
    }

    const siguienteAq       = attempt.attemptQuestions[totalRespondidas];
    const siguientePregunta = await this.prisma.question.findUnique({
      where: { id: siguienteAq.questionId },
      select: {
        id:       true,
        texto:    true,
        opciones: true,
        formato:  true,
      },
    });

    return {
      tipo:        'continua',
      correcta:    esCorrecta,
      correcta_era: pregunta.correct,
      explicacion:  pregunta.explicacion,
      numero:       totalRespondidas + 1,
      total:        totalPreguntas,
      pregunta:     siguientePregunta,
    };
  }

  // ─── Ver todos los intentos completados (Docente/Admin) ─────────────────
  async findAll(materiaId: string | undefined, role: Role, carreraId?: string) {
    if (!materiaId) {
      if (role !== Role.ADMIN) {
        throw new ForbiddenException('Se requiere materiaId para docentes');
      }
      return this.prisma.attempt.findMany({
        where: { completado: true },
        include: {
          user:    { select: { id: true, name: true, email: true } },
          materia: { select: { id: true, slug: true, label: true } },
        },
        orderBy: { completedAt: 'desc' },
      });
    }

    if (role === Role.DOCENTE) {
      const materia = await this.prisma.materia.findFirst({
        where: {
          id:       materiaId,
          carreras: { some: { id: carreraId } },
        },
      });
      if (!materia) {
        throw new ForbiddenException('No tenés acceso a esta materia');
      }
    }

    return this.prisma.attempt.findMany({
      where: { completado: true, materiaId },
      include: {
        user:    { select: { id: true, name: true, email: true } },
        materia: { select: { id: true, slug: true, label: true } },
      },
      orderBy: { completedAt: 'desc' },
    });
  }

  // ─── Ver intentos de un alumno (Docente/Admin) ──────────────────────────
  async findByStudent(
    studentId: string,
    materiaId: string | undefined,
    carreraId: string | undefined,
    role: Role,
    docenteCarreraId?: string,
  ) {
    if (!studentId) {
      throw new BadRequestException('Se requiere el parámetro studentId');
    }

    if (role === Role.DOCENTE) {
      if (!materiaId || !carreraId) {
        throw new BadRequestException('Se requiere materiaId y carreraId');
      }
      const materia = await this.prisma.materia.findFirst({
        where: {
          id:       materiaId,
          carreras: { some: { id: docenteCarreraId } },
        },
      });
      if (!materia) {
        throw new ForbiddenException('No tenés acceso a esta materia');
      }
    }

    const estudiante = await this.prisma.user.findFirst({
      where: { id: studentId, role: Role.ESTUDIANTE },
      select: { id: true, name: true, email: true },
    });

    if (!estudiante) {
      throw new NotFoundException(`No se encontró ningún estudiante con id "${studentId}"`);
    }

    const attempts = await this.prisma.attempt.findMany({
      where: {
        userId:     estudiante.id,
        completado: true,
        ...(materiaId ? { materiaId } : {}),
        ...(carreraId ? { materia: { carreras: { some: { id: carreraId } } } } : {}),
      },
      include: {
        materia:    { select: { id: true, slug: true, label: true } },
        answerLogs: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    if (attempts.length === 0) {
      throw new NotFoundException('El alumno no tiene cuestionarios realizados');
    }

    return { estudiante, attempts };
  }

  // ─── Ver intentos propios completados (Estudiante) ──────────────────────
  async findMine(userId: string, materiaId?: string) {
    const attempts = await this.prisma.attempt.findMany({
      where: {
        userId,
        completado: true,
        ...(materiaId ? { materiaId } : {}),
      },
      include: {
        materia: { select: { id: true, slug: true, label: true } },
      },
      orderBy: { completedAt: 'desc' },
    });

    if (attempts.length === 0) {
      throw new NotFoundException('No contestaste ningún cuestionario');
    }

    return attempts;
  }

  // ─── Ver detalle de un intento (Docente/Admin) ──────────────────────────
  async findOne(id: string, role: Role, carreraId?: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id },
      include: {
        user:       { select: { id: true, name: true, email: true } },
        materia:    { select: { id: true, slug: true, label: true } },
        answerLogs: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException(`Intento "${id}" no encontrado`);
    }

    if (role === Role.DOCENTE) {
      const materia = await this.prisma.materia.findFirst({
        where: {
          id:       attempt.materiaId,
          carreras: { some: { id: carreraId } },
        },
      });
      if (!materia) {
        throw new ForbiddenException('No tenés acceso a este intento');
      }
    }

    return attempt;
  }
}
