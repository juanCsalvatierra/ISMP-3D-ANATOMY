import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        carreraId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  async login(dto: LoginDto) {
    // 1. Buscar el usuario por email en la BD
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // 2. Si no existe, lanzar error
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Comparar la password con el hash guardado en la BD
    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 4. Generar el JWT con el id, email y role del usuario
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    // 5. Devolver el token y los datos del usuario (sin el hash)
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        carreraId: user.carreraId,
      },
    };
  }
}
