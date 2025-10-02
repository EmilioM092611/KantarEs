import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('=== RolesGuard ===');
    console.log('Roles requeridos:', requiredRoles);
    console.log('Usuario:', user);
    console.log('Rol del usuario:', user?.rol?.nombre);

    // Verificar que el usuario existe
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Verificar que el usuario tiene rol
    if (!user.rol || !user.rol.nombre) {
      throw new ForbiddenException('Usuario sin rol asignado');
    }

    // Verificar que el rol del usuario está en los roles permitidos
    const hasRole = requiredRoles.some(
      (role) => role.toLowerCase() === user.rol.nombre.toLowerCase(),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de estos roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
