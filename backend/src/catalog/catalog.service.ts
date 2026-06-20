import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  carreras() {
    return this.prisma.carrera.findMany({
      select: { id: true, slug: true, label: true },
      orderBy: { label: 'asc' },
    });
  }

  materias(carreraId?: string) {
    return this.prisma.materia.findMany({
      where: carreraId
        ? { carreras: { some: { id: carreraId } } }
        : undefined,
      select: { id: true, slug: true, label: true },
      orderBy: { label: 'asc' },
    });
  }

  async unidades(materiaId: string) {
    const rows = await this.prisma.questionMateria.findMany({
      where: { materiaId },
      select: { unidad: true },
      distinct: ['unidad'],
      orderBy: { unidad: 'asc' },
    });
    return rows.map((r) => r.unidad);
  }
}
