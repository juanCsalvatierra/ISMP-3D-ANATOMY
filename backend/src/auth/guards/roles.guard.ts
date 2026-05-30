import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Leer los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Si el endpoint no tiene @Roles(), dejar pasar
    if (!requiredRoles) return true;

    // 3. Obtener el usuario del request (lo puso JwtGuard)
    const { user } = context.switchToHttp().getRequest();

    // 4. Verificar si el rol del usuario está en los roles requeridos
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('No tenés permiso para realizar esta acción');
    }

    return true;
  }
}
