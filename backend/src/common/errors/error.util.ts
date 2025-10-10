import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

export interface ErrorPayload {
  code: ErrorCode;
  message: string;
  details?: any;
  status?: HttpStatus;
}

/**
 * Create a standardized HttpException with our error envelope.
 */
export function throwApiError({
  code,
  message,
  details,
  status = HttpStatus.BAD_REQUEST,
}: ErrorPayload): never {
  const response = {
    success: false,
    code,
    message,
    details,
  };
  throw new HttpException(response, status);
}
