/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
// backend/src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extraer mensaje y detalles
    let message = 'Error en la solicitud';
    let errors: any = null;

    if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || message;
      errors = responseObj.errors || responseObj.error || null;
    } else {
      message = exceptionResponse as string;
    }

    // Formato de error estándar unificado (Mejora 13)
    const errorResponse = {
      success: false,
      code: status,
      message: Array.isArray(message) ? message : [message],
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: (request as any).id || 'unknown',
    };

    // Log del error
    this.logger.error(
      `HTTP ${status} Error: ${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
    );

    response.status(status).json(errorResponse);
  }
}
