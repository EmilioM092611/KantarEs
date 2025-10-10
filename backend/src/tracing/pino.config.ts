import { LoggerModuleAsyncParams } from 'nestjs-pino';

export const pinoConfig: LoggerModuleAsyncParams = {
  useFactory: () => {
    const pretty = process.env.LOG_PRETTY === 'true';
    const level = process.env.LOG_LEVEL || 'info';
    return {
      pinoHttp: {
        level,
        transport: pretty
          ? {
              target: 'pino-pretty',
              options: { translateTime: 'SYS:standard', singleLine: true },
            }
          : undefined,
        autoLogging: false, // we'll log via interceptor to add context
        genReqId: (req: any) => req?.id, // use our correlation id from middleware
        redact: {
          paths: [
            'req.headers.authorization',
            'req.body.password',
            "res.headers['set-cookie']",
          ],
          remove: true,
        },
      },
    };
  },
};
