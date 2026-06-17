import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCuestionarioDto } from './dto/create-cuestionario.dto';
import { UpdateCuestionarioDto } from './dto/update-cuestionario.dto';
import { Role } from '@prisma/client';

@Injectable()
export class CuestionariosService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Listar todos (opcionalmente filtrar por materia) ────────────────────
  findAll(materiaId?: string) {
    return this.prisma.cuestionario.findMany({
      where: materiaId ? { materiaId } : undefined,
      include: {
        materia: { select: { id: true, slug: true, label: true } },
        autor: { select: { id: true, name: true } },
        _count: { select: { preguntas: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Obtener uno con sus preguntas ───────────────────────────────────────
  async findOne(id: string) {
    const cuestionario = await this.prisma.cuestionario.findUnique({
      where: { id },
      include: {
        materia: { select: { id: true, slug: true, label: true } },
        autor: { select: { id: true, name: true } },
        preguntas: { orderBy: { orden: 'asc' } },
      },
    });

    if (!cuestionario) {
      throw new NotFoundException(`Cuestionario con id "${id}" no encontrado`);
    }

    return cuestionario;
  }

  // ─── Crear cuestionario con sus preguntas ────────────────────────────────
  create(dto: CreateCuestionarioDto, autorId: string) {
    return this.prisma.cuestionario.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion ?? '',
        materiaId: dto.materiaId,
        formato: dto.formato,
        autorId,
        // Creamos las preguntas anidadas en la misma operación
        preguntas: {
          create: dto.preguntas.map((pregunta, index) => ({
            orden: index,
            texto: pregunta.texto,
            opciones: pregunta.opciones,
            correct: pregunta.correcta,
            explicacion: pregunta.explicacion ?? '',
          })),
        },
      },
      include: {
        preguntas: { orderBy: { orden: 'asc' } },
        autor: { select: { id: true, name: true } },
      },
    });
  }

  // ─── Actualizar (solo autor o ADMIN) ────────────────────────────────────
  async update(
    id: string,
    dto: UpdateCuestionarioDto,
    requesterId: string,
    requesterRole: Role,
  ) {
    // Primero verificamos que existe
    const existing = await this.prisma.cuestionario.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Cuestionario con id "${id}" no encontrado`);
    }

    // Solo el autor o un ADMIN puede modificarlo
    if (existing.autorId !== requesterId && requesterRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Solo el autor o un administrador puede modificar este cuestionario',
      );
    }

    // Si el DTO trae nuevas preguntas, las reemplazamos todas
    // (borramos las viejas y creamos las nuevas)
    const { preguntas, ...restoDto } = dto;

    return this.prisma.cuestionario.update({
      where: { id },
      data: {
        ...restoDto,
        ...(preguntas && {
          preguntas: {
            deleteMany: {}, // borra todas las preguntas actuales
            create: preguntas.map((pregunta, index) => ({
              orden: index,
              texto: pregunta.texto ?? '',
              opciones: pregunta.opciones ?? [],
              correct: pregunta.correcta ?? 0,
              explicacion: pregunta.explicacion ?? '',
            })),
          },
        }),
      },
      include: {
        preguntas: { orderBy: { orden: 'asc' } },
        autor: { select: { id: true, name: true } },
      },
    });
  }

  // ─── Eliminar (solo autor o ADMIN) ──────────────────────────────────────
  async remove(id: string, requesterId: string, requesterRole: Role) {
    const existing = await this.prisma.cuestionario.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Cuestionario con id "${id}" no encontrado`);
    }

    if (existing.autorId !== requesterId && requesterRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'Solo el autor o un administrador puede eliminar este cuestionario',
      );
    }

    await this.prisma.cuestionario.delete({ where: { id } });
    return { message: 'Cuestionario eliminado correctamente' };
  }
}
