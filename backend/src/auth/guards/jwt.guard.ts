import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Obtener el request HTTP
    const request = context.switchToHttp().getRequest<Request>();

    // 2. Extraer el token del header Authorization: Bearer <token>
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no encontrado');
    }

    const token = authHeader.split(' ')[1];

    // 3. Verificar que el token sea válido
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET ?? 'secreto_temporal',
      });

      // 4. Adjuntar el payload al request para usarlo en el controller
      request['user'] = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
