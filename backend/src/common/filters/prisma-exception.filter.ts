// /src/common/filters/prisma-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    let status = HttpStatus.BAD_REQUEST;
    let message = exception.message;

    if (exception.code === 'P2002')
      message = 'Registro duplicado (índice único)';
    if (exception.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      message = 'Registro no encontrado';
    }

    res
      .status(status)
      .json({ statusCode: status, message, code: exception.code });
  }
}
