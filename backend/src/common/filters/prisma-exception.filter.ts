// src/common/filters/prisma-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    // Errores conocidos de Prisma
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const code = exception.code;
      if (code === 'P2002') {
        // Unique constraint failed
        const fields = (exception.meta as any)?.target ?? [];
        throw new ConflictException(
          `Registro duplicado${fields.length ? ` en: ${fields}` : ''}`,
        );
      }
      if (code === 'P2003') {
        // Foreign key constraint
        throw new ConflictException('Violación de integridad referencial');
      }
      if (code === 'P2025') {
        // Record not found
        throw new NotFoundException('Registro no encontrado');
      }
      throw new InternalServerErrorException(
        `Error de base de datos (${code})`,
      );
    }

    // Si ya es HttpException, delega
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      return res.status(status).json(body);
    }

    // Desconocido
    const e = new InternalServerErrorException('Error interno');
    return res.status(e.getStatus()).json(e.getResponse());
  }
}
