import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

const AUTH_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  dni: true,
  carreras: { select: { carreraId: true } },
  createdAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: AUTH_USER_SELECT,
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { carreras: { select: { carreraId: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (user.estado === 'PENDIENTE') {
      throw new UnauthorizedException('Tu cuenta está pendiente de activación. Contactá a un administrador.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      carreraIds: user.carreras.map((c) => c.carreraId),
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        dni: user.dni,
        carreras: user.carreras,
      },
    };
  }
}
