import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ─── Registro público (sin auth) ────────────────────────────────────────
  async register(dto: RegisterUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('El email ya está en uso');

    const passwordHash    = await bcrypt.hash(dto.password, 10);
    const activationCode  = randomBytes(4).toString('hex').toUpperCase();

    await this.prisma.user.create({
      data: {
        name:         dto.name,
        email:        dto.email,
        passwordHash,
        role:         'ESTUDIANTE',
        carreraId:    dto.carreraId,
        estado:       'PENDIENTE',
        activationCode,
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

    const term = `%${search}%`;
    return this.prisma.$queryRaw<{ id: string; name: string; email: string; carreraId: string | null }[]>`
      SELECT id, name, email, "carreraId" FROM "User"
      WHERE role = 'ESTUDIANTE'
        AND (
          unaccent(lower(name)) ILIKE unaccent(lower(${term}))
          OR email ILIKE ${term}
        )
      ORDER BY name ASC
    `;
  }

  // ─── Listar usuarios ────────────────────────────────────────────────────────
  async findAll(role?: string, carreraId?: string) {
    return this.prisma.user.findMany({
      where: {
        ...(role && { role: role as any }),
        ...(carreraId && { carreraId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        carreraId: true,
        createdAt: true,
      },
    });
  }

  // ─── Ver un usuario ─────────────────────────────────────────────────────────
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        carreraId: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException(`Usuario con id ${id} no encontrado`);

    return user;
  }

  // ─── Crear usuario ──────────────────────────────────────────────────────────
  async create(dto: CreateUserDto) {
    // Verificar que el email no esté en uso
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) throw new ConflictException('El email ya está en uso');

    // Hashear la contraseña antes de guardar
    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        carreraId: dto.carreraId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        carreraId: true,
        createdAt: true,
      },
    });
  }

  // ─── Editar usuario ─────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateUserDto) {
    // Verificar que el usuario existe
    await this.findOne(id);

    // Si viene nueva contraseña, hashearla
    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        carreraId: true,
        createdAt: true,
      },
    });
  }

  // ─── Borrar usuario ─────────────────────────────────────────────────────────
  async remove(id: string) {
    // Verificar que el usuario existe
    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });

    return { message: `Usuario ${id} eliminado correctamente` };
  }
}
