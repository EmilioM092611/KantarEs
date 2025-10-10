/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const httpCtx = context.switchToHttp();
    const req: any = httpCtx.getRequest();
    const res: any = httpCtx.getResponse();

    const requestId = req?.id;
    const method = req?.method;
    const url = req?.url;

    this.logger.assign({ requestId });
    this.logger.info(
      { method, url, body: req?.body, params: req?.params, query: req?.query },
      'Incoming request',
    );

    return next.handle().pipe(
      tap((data) => {
        const ms = Date.now() - now;
        this.logger.info(
          { requestId, statusCode: res?.statusCode, tookMs: ms },
          'Outgoing response',
        );
      }),
      catchError((err, caught) => {
        const ms = Date.now() - now;
        this.logger.error({ requestId, err, tookMs: ms }, 'Request failed');
        throw err;
      }),
    );
  }
}
