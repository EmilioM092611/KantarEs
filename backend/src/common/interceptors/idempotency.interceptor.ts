/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { IDEMPOTENT_KEY } from '../decorators/idempotent.decorator';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const isIdempotent = this.reflector.get<boolean>(
      IDEMPOTENT_KEY,
      context.getHandler(),
    );

    if (!isIdempotent) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['idempotency-key'];

    if (!idempotencyKey) {
      return next.handle();
    }

    // Crear key única para este endpoint
    const cacheKey = `idempotency:${request.method}:${request.url}:${idempotencyKey}`;

    // Verificar si ya existe
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    // Ejecutar y guardar
    return next.handle().pipe(
      tap(async (response) => {
        await this.cache.set(cacheKey, response, 3600000); // 1 hora
      }),
    );
  }
}
