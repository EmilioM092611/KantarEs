// backend/src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(`${method} ${url} - ${responseTime}ms`);
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `${method} ${url} - ${responseTime}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
