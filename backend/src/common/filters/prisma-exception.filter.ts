/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
// backend/src/common/filters/prisma-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error en la base de datos';
    let errors: any = null;

    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un registro con esos datos';
        errors = {
          fields: exception.meta?.target,
          code: exception.code,
        };
        break;

      case 'P2025':
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Registro no encontrado';
        errors = { code: exception.code };
        break;

      case 'P2003':
        // Foreign key constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Referencia inválida a otro registro';
        errors = {
          field: exception.meta?.field_name,
          code: exception.code,
        };
        break;

      case 'P2014':
        // Required relation violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Relación requerida no establecida';
        errors = { code: exception.code };
        break;

      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Error en la operación de base de datos';
        errors = {
          code: exception.code,
          meta: exception.meta,
        };
    }

    // Formato unificado con http-exception.filter (Mejora 13)
    const errorResponse = {
      success: false,
      code: status,
      message: [message],
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: (request as any).id || 'unknown',
    };

    this.logger.error(
      `Prisma Error ${exception.code}: ${request.method} ${request.url}`,
      JSON.stringify(errors),
    );

    response.status(status).json(errorResponse);
  }
}
