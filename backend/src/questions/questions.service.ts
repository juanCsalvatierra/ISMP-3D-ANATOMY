import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, EstadoPregunta, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

// Qué materias puede revisar (aprobar / volver a borrador) un usuario:
//   - ADMIN   → todas ('todas')
//   - DOCENTE → las materias de sus carreras
type AlcanceRevision = 'todas' | string[];

const INCLUDE_PREGUNTA = {
  materias: {
    include: {
      materia: { select: { id: true, slug: true, label: true } },
      aprobadaPor: { select: { id: true, name: true } },
    },
  },
  autor: { select: { id: true, name: true } },
} satisfies Prisma.QuestionInclude;

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Alcance de revisión ─────────────────────────────────────────────────
  async alcanceRevision(userId: string, role: Role): Promise<AlcanceRevision> {
    if (role === Role.ADMIN) return 'todas';
    const materias = await this.prisma.materia.findMany({
      where: { carreras: { some: { users: { some: { userId } } } } },
      select: { id: true },
    });
    return materias.map((m) => m.id);
  }

  private puede(alcance: AlcanceRevision, materiaId: string): boolean {
    return alcance === 'todas' || alcance.includes(materiaId);
  }

  /** Materias en las que el usuario puede revisar (para armar filtros de la UI). */
  async materiasRevisables(userId: string, role: Role) {
    const alcance = await this.alcanceRevision(userId, role);
    return this.prisma.materia.findMany({
      where: alcance === 'todas' ? undefined : { id: { in: alcance } },
      select: { id: true, slug: true, label: true },
      orderBy: { label: 'asc' },
    });
  }

  // ─── Listar preguntas del banco ──────────────────────────────────────────
  // Filtros opcionales: materiaId, unidad, formato, estado (de la materia), tema
  findAll(materiaId?: string, unidad?: number, formato?: string, estado?: string, tema?: string) {
    const destino: Prisma.QuestionMateriaWhereInput = {
      ...(materiaId ? { materiaId } : {}),
      ...(materiaId && unidad !== undefined && unidad > 0 ? { unidad } : {}),
      ...(estado === EstadoPregunta.BORRADOR || estado === EstadoPregunta.APROBADA ? { estado } : {}),
    };

    return this.prisma.question.findMany({
      where: {
        ...(formato ? { formato: formato as any } : {}),
        ...(tema ? { tema: { startsWith: tema } } : {}),
        ...(Object.keys(destino).length > 0 ? { materias: { some: destino } } : {}),
      },
      include: INCLUDE_PREGUNTA,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Cola de revisión (acotada al alcance del usuario) ──────────────────
  // Devuelve las preguntas que tienen, en una materia que el usuario puede
  // revisar, un destino en el `estado` pedido. Cada destino viaja con
  // `revisable` para que la UI sepa dónde puede actuar.
  async revision(
    userId: string,
    role: Role,
    opts: { estado?: string; materiaId?: string; unidad?: number; tema?: string },
  ) {
    const alcance = await this.alcanceRevision(userId, role);
    const estado = opts.estado === EstadoPregunta.APROBADA ? EstadoPregunta.APROBADA : EstadoPregunta.BORRADOR;

    if (opts.materiaId && !this.puede(alcance, opts.materiaId)) return [];

    const destino: Prisma.QuestionMateriaWhereInput = {
      estado,
      ...(alcance === 'todas' ? {} : { materiaId: { in: alcance } }),
      ...(opts.materiaId ? { materiaId: opts.materiaId } : {}),
      ...(opts.materiaId && opts.unidad !== undefined && opts.unidad > 0 ? { unidad: opts.unidad } : {}),
    };

    const preguntas = await this.prisma.question.findMany({
      where: {
        ...(opts.tema ? { tema: { startsWith: opts.tema } } : {}),
        materias: { some: destino },
      },
      include: INCLUDE_PREGUNTA,
      orderBy: [{ tema: 'asc' }, { createdAt: 'asc' }],
    });

    return preguntas.map((p) => ({
      ...p,
      materias: p.materias.map((m) => ({ ...m, revisable: this.puede(alcance, m.materiaId) })),
    }));
  }

  // ─── Obtener una pregunta por id ─────────────────────────────────────────
  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: INCLUDE_PREGUNTA,
    });

    if (!question) {
      throw new NotFoundException(`Pregunta con id "${id}" no encontrada`);
    }

    return question;
  }

  // ─── Crear pregunta en el banco ──────────────────────────────────────────
  // Un docente crea ya aprobado en sus materias; en una materia ajena queda como
  // borrador hasta que la revise quien corresponda.
  async create(dto: CreateQuestionDto, autorId: string, role: Role) {
    const alcance = await this.alcanceRevision(autorId, role);

    return this.prisma.question.create({
      data: {
        texto: dto.question,
        opciones: dto.options,
        correct: dto.correct,
        explicacion: dto.explanation ?? '',
        formato: dto.formato,
        tema: dto.tema,
        autorId,
        materias: {
          create: dto.materias.map((m) => this.destinoNuevo(m, alcance, autorId)),
        },
      },
      include: INCLUDE_PREGUNTA,
    });
  }

  private destinoNuevo(m: { materiaId: string; unidad: number }, alcance: AlcanceRevision, userId: string) {
    const aprobada = this.puede(alcance, m.materiaId);
    return {
      materiaId: m.materiaId,
      unidad: m.unidad,
      estado: aprobada ? EstadoPregunta.APROBADA : EstadoPregunta.BORRADOR,
      aprobadaAt: aprobada ? new Date() : null,
      aprobadaPorId: aprobada ? userId : null,
    };
  }

  // ─── Actualizar pregunta ─────────────────────────────────────────────────
  async update(id: string, dto: UpdateQuestionDto, requesterId: string, requesterRole: Role) {
    const existing = await this.prisma.question.findUnique({
      where: { id },
      include: { materias: true },
    });

    if (!existing) {
      throw new NotFoundException(`Pregunta con id "${id}" no encontrada`);
    }

    // Revisar (aprobar / volver a borrador) es un cambio aparte del contenido.
    if (dto.estado !== undefined) {
      const otros = Object.keys(dto).filter((k) => k !== 'estado' && k !== 'materiaId');
      if (otros.length > 0) {
        throw new BadRequestException('El estado se cambia por separado: no se puede combinar con ediciones');
      }
      return this.revisar(existing, dto.estado, dto.materiaId, requesterId, requesterRole);
    }

    if (existing.autorId !== requesterId && requesterRole !== Role.ADMIN) {
      throw new ForbiddenException('Solo el autor o un administrador puede modificar esta pregunta');
    }

    const { materias, ...rest } = dto;
    const alcance = materias ? await this.alcanceRevision(requesterId, requesterRole) : 'todas';

    return this.prisma.question.update({
      where: { id },
      data: {
        ...(rest.question    !== undefined && { texto:       rest.question }),
        ...(rest.options     !== undefined && { opciones:    rest.options }),
        ...(rest.correct     !== undefined && { correct:     rest.correct }),
        ...(rest.explanation !== undefined && { explicacion: rest.explanation }),
        ...(rest.formato     !== undefined && { formato:     rest.formato }),
        ...(rest.tema        !== undefined && { tema:        rest.tema }),
        ...(materias && {
          materias: {
            deleteMany: {},
            // Los destinos que se mantienen conservan su estado de aprobación;
            // los nuevos siguen la regla de create().
            create: materias.map((m) => {
              const previo = existing.materias.find((e) => e.materiaId === m.materiaId);
              return previo
                ? {
                    materiaId: m.materiaId,
                    unidad: m.unidad,
                    estado: previo.estado,
                    aprobadaAt: previo.aprobadaAt,
                    aprobadaPorId: previo.aprobadaPorId,
                  }
                : this.destinoNuevo(m, alcance, requesterId);
            }),
          },
        }),
      },
      include: INCLUDE_PREGUNTA,
    });
  }

  // ─── Revisión: aprobar / volver a borrador ───────────────────────────────
  // Actúa solo sobre las materias del alcance del usuario (todas si es ADMIN).
  // Si se indica `materiaId`, solo sobre esa.
  private async revisar(
    existing: { id: string; materias: { materiaId: string }[] },
    estado: EstadoPregunta,
    materiaId: string | undefined,
    userId: string,
    role: Role,
  ) {
    const alcance = await this.alcanceRevision(userId, role);

    if (materiaId && !existing.materias.some((m) => m.materiaId === materiaId)) {
      throw new BadRequestException('La pregunta no pertenece a esa materia');
    }

    const objetivo = existing.materias
      .map((m) => m.materiaId)
      .filter((id) => (materiaId ? id === materiaId : true))
      .filter((id) => this.puede(alcance, id));

    if (objetivo.length === 0) {
      throw new ForbiddenException(
        'Esta pregunta no pertenece a ninguna de tus materias: solo podés revisar las de tus carreras',
      );
    }

    const aprobar = estado === EstadoPregunta.APROBADA;
    await this.prisma.questionMateria.updateMany({
      where: { questionId: existing.id, materiaId: { in: objetivo } },
      data: {
        estado,
        aprobadaAt: aprobar ? new Date() : null,
        aprobadaPorId: aprobar ? userId : null,
      },
    });

    return this.findOne(existing.id);
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
