import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles?.length) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    const has = roles.some(
      (r) =>
        user?.rol?.nombre === r ||
        (Array.isArray(user?.roles) && user.roles.includes(r)),
    );
    if (!has) throw new ForbiddenException('No tienes permisos');
    return true;
  }
}
