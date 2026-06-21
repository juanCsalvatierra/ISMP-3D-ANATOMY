import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  dni: true,
  role: true,
  estado: true,
  carreras: { select: { carreraId: true } },
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ─── Registro público (sin auth) ────────────────────────────────────────
  async register(dto: RegisterUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El email ya está en uso');

    const passwordHash   = await bcrypt.hash(dto.password, 10);
    const activationCode = randomBytes(4).toString('hex').toUpperCase();

    await this.prisma.user.create({
      data: {
        name:          dto.name,
        email:         dto.email,
        passwordHash,
        role:          'ESTUDIANTE',
        estado:        'PENDIENTE',
        activationCode,
        ...(dto.carreraIds?.length && {
          carreras: { create: dto.carreraIds.map(carreraId => ({ carreraId })) },
        }),
      },
    });

    return {
      message:        'Registro exitoso. Enviá este código a un administrador para activar tu cuenta.',
      activationCode,
    };
  }

  // ─── Activar usuario por código (solo ADMIN) ─────────────────────────────
  async activate(code: string) {
    const user = await this.prisma.user.findUnique({
      where: { activationCode: code },
    });

    if (!user) throw new NotFoundException('Código de activación inválido');
    if (user.estado === 'ACTIVO') throw new BadRequestException('El usuario ya está activo');

    await this.prisma.user.update({
      where: { id: user.id },
      data:  { estado: 'ACTIVO', activationCode: null },
    });

    return { message: `Usuario ${user.name} activado correctamente` };
  }

  // ─── Buscar estudiantes por nombre o email (Docente/Admin) ────────────────
  async search(search: string) {
    if (!search) throw new NotFoundException('Se requiere el parámetro search');

    return this.prisma.user.findMany({
      where: {
        role: 'ESTUDIANTE',
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: USER_SELECT,
      orderBy: { name: 'asc' },
    });
  }

  // ─── Listar usuarios ────────────────────────────────────────────────────────
  async findAll(role?: string, carreraId?: string) {
    return this.prisma.user.findMany({
      where: {
        ...(role && { role: role as any }),
        ...(carreraId && { carreras: { some: { carreraId } } }),
      },
      select: USER_SELECT,
    });
  }

  // ─── Ver un usuario ─────────────────────────────────────────────────────────
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);

    return user;
  }

  // ─── Crear usuario ──────────────────────────────────────────────────────────
  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('El email ya está en uso');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        dni: dto.dni,
        passwordHash,
        role: dto.role,
        estado: 'ACTIVO',
        ...(dto.carreraIds?.length && {
          carreras: { create: dto.carreraIds.map(carreraId => ({ carreraId })) },
        }),
      },
      select: USER_SELECT,
    });
  }

  // ─── Editar usuario ─────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const { password, carreraIds, ...rest } = dto;

    const data: any = { ...rest };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    if (carreraIds !== undefined) {
      await this.prisma.userCarrera.deleteMany({ where: { userId: id } });
      if (carreraIds.length > 0) {
        await this.prisma.userCarrera.createMany({
          data: carreraIds.map(carreraId => ({ userId: id, carreraId })),
        });
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });
  }

  // ─── Borrar usuario ─────────────────────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: `Usuario ${id} eliminado correctamente` };
  }
}
