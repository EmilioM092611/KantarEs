/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const headerName = (
      process.env.REQUEST_ID_HEADER || 'x-request-id'
    ).toLowerCase();
    const reqId = (req.headers as any)[headerName] || randomUUID();
    (req as any).id = reqId;
    res.header('x-request-id', String(reqId));
    next();
  }
}
