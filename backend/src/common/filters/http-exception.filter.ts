import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ErrorCode } from '../errors/error-codes';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<any>();
    const res = ctx.getResponse<any>();

    const requestId =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      (req?.headers?.['x-request-id'] as string) || (req as any)?.id;

    // If this is already an HttpException, use its response body and status.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload =
        typeof body === 'string' ? { message: body } : (body as any);
      return res.status(status).send({
        success: false,
        requestId,
        timestamp: new Date().toISOString(),
        path: req?.url,
        ...payload,
      });
    }

    // Unknown/unexpected error
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = {
      success: false,
      code: ErrorCode.COM_INTERNAL,
      message: 'Error interno del servidor',
      details:
        process.env.NODE_ENV === 'production'
          ? undefined
          : { error: String(exception?.message || exception) },
      requestId,
      timestamp: new Date().toISOString(),
      path: req?.url,
    };
    return res.status(status).send(payload);
  }
}
