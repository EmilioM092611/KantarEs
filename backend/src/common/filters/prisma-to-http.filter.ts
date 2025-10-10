import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { throwApiError } from '../errors/error.util';
import { ErrorCode } from '../errors/error-codes';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaToHttpFilter implements ExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    // Map common Prisma error codes
    if (exception.code === 'P2002') {
      // Unique constraint failed
      throwApiError({
        code: ErrorCode.COM_CONFLICT,
        message: 'Recurso duplicado (violación de unicidad)',
      });
    }
    if (exception.code === 'P2025') {
      // Record not found
      throwApiError({
        code: ErrorCode.COM_NOT_FOUND,
        message: 'Recurso no encontrado',
      });
    }

    // Fallback: conflict to avoid leaking internals
    throwApiError({
      code: ErrorCode.COM_CONFLICT,
      message: 'Error de base de datos',
      details:
        process.env.NODE_ENV === 'production'
          ? undefined
          : { code: exception.code, meta: exception.meta },
    });
  }
}
