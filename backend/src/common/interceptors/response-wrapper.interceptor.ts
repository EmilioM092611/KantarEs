// backend/src/common/interceptors/response-wrapper.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  path: string;
  method: string;
}

@Injectable()
export class ResponseWrapperInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;
    const method = request.method;

    return next.handle().pipe(
      map((data) => {
        // Si el data ya tiene formato de respuesta, no wrappear de nuevo
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            timestamp: new Date().toISOString(),
            path,
            method,
          };
        }

        // Wrappear respuesta estándar
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          path,
          method,
        };
      }),
    );
  }
}
