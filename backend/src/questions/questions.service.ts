import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Role } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Listar preguntas del banco ──────────────────────────────────────────
  // Filtros opcionales: materiaId, unidad, formato
  findAll(materiaId?: string, unidad?: number, formato?: string) {
    return this.prisma.question.findMany({
      where: {
        ...(formato ? { formato: formato as any } : {}),
        ...(materiaId ? {
          materias: {
            some: {
              materiaId,
              ...(unidad !== undefined && unidad > 0 ? { unidad } : {}),
            },
          },
        } : {}),
      },
      include: {
        materias: {
          include: { materia: { select: { id: true, slug: true, label: true } } },
        },
        autor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Obtener una pregunta por id ─────────────────────────────────────────
  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        materias: {
          include: { materia: { select: { id: true, slug: true, label: true } } },
        },
        autor: { select: { id: true, name: true } },
      },
    });

    if (!question) {
      throw new NotFoundException(`Pregunta con id "${id}" no encontrada`);
    }

    return question;
  }

  // ─── Crear pregunta en el banco ──────────────────────────────────────────
  create(dto: CreateQuestionDto, autorId: string) {
    return this.prisma.question.create({
      data: {
        texto: dto.question,
        opciones: dto.options,
        correct: dto.correct,
        explicacion: dto.explanation ?? '',
        formato: dto.formato,
        autorId,
        materias: {
          create: dto.materias.map((m) => ({
            materiaId: m.materiaId,
            unidad: m.unidad,
          })),
        },
      },
      include: {
        materias: {
          include: { materia: { select: { id: true, slug: true, label: true } } },
        },
        autor: { select: { id: true, name: true } },
      },
    });
  }

  // ─── Actualizar pregunta ─────────────────────────────────────────────────
  async update(id: string, dto: UpdateQuestionDto, requesterId: string, requesterRole: Role) {
    const existing = await this.prisma.question.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Pregunta con id "${id}" no encontrada`);
    }

    if (existing.autorId !== requesterId && requesterRole !== Role.ADMIN) {
      throw new ForbiddenException('Solo el autor o un administrador puede modificar esta pregunta');
    }

    const { materias, ...rest } = dto;

    return this.prisma.question.update({
      where: { id },
      data: {
        ...(rest.question    !== undefined && { texto:       rest.question }),
        ...(rest.options     !== undefined && { opciones:    rest.options }),
        ...(rest.correct     !== undefined && { correct:     rest.correct }),
        ...(rest.explanation !== undefined && { explicacion: rest.explanation }),
        ...(rest.formato     !== undefined && { formato:     rest.formato }),
        ...(materias && {
          materias: {
            deleteMany: {},
            create: materias.map((m) => ({
              materiaId: m.materiaId,
              unidad: m.unidad,
            })),
          },
        }),
      },
      include: {
        materias: {
          include: { materia: { select: { id: true, slug: true, label: true } } },
        },
        autor: { select: { id: true, name: true } },
      },
    });
  }

  // ─── Eliminar pregunta ───────────────────────────────────────────────────
  async remove(id: string, requesterId: string, requesterRole: Role) {
    const existing = await this.prisma.question.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Pregunta con id "${id}" no encontrada`);
    }

    if (existing.autorId !== requesterId && requesterRole !== Role.ADMIN) {
      throw new ForbiddenException('Solo el autor o un administrador puede eliminar esta pregunta');
    }

    await this.prisma.question.delete({ where: { id } });
    return { message: 'Pregunta eliminada correctamente' };
  }
}
