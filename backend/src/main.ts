/* eslint-disable @typescript-eslint/no-floating-promises */
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

// === Agregados (hardening) ===
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestLoggerInterceptor } from './common/logging/request-logger.interceptor';
import { PinoLogger } from 'nestjs-pino';
// ==============================

// Tracing opcional por OpenTelemetry (no falla si no está instalado).
// Actívalo con: OTEL_TRACING_ENABLED=true y (opcional) OTEL_EXPORTER_OTLP_ENDPOINT.
// No requiere imports fijos: usa imports dinámicos.
async function bootstrapTracingIfEnabled() {
  if (process.env.OTEL_TRACING_ENABLED !== 'true') return null;
  try {
    const { NodeSDK } = (await import('@opentelemetry/sdk-node')) as any;
    const { getNodeAutoInstrumentations } = (await import(
      '@opentelemetry/auto-instrumentations-node'
    )) as any;
    const { OTLPTraceExporter } = (await import(
      '@opentelemetry/exporter-trace-otlp-http'
    )) as any;

    const sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter({
        url:
          process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
          'http://localhost:4318/v1/traces',
      }),
      instrumentations: getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-redis-4': { enabled: true },
        // Para Prisma puedes añadir middleware de spans personalizados si lo deseas.
      }),
    });

    await sdk.start();
    process.on('SIGTERM', () => {
      sdk.shutdown().catch(() => {});
    });
    process.on('beforeExit', () => {
      sdk.shutdown().catch(() => {});
    });
    return sdk;
  } catch (e: any) {
    // No romper el arranque si faltan dependencias o falla la init
    console.warn(
      'Tracing deshabilitado (OTel no instalado o fallo init):',
      e?.message ?? e,
    );
    return null;
  }
}

export async function bootstrap() {
  // === Tracing opcional (antes de crear la app) ===
  await bootstrapTracingIfEnabled();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Seguridad
  app.use(helmet());

  // CORS por ENV
  const origins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : true;
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtro Prisma → HTTP (tu filtro existente)
  app.useGlobalFilters(new PrismaExceptionFilter());

  // === Agregados (hardening) ===
  // Filtro global de HTTP uniforme (envelope con code/requestId/timestamp/path)
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Interceptor de logging de solicitudes/respuestas/errores con correlación (Pino)
  const pinoLogger = await app.resolve(PinoLogger);
  app.useGlobalInterceptors(new RequestLoggerInterceptor(pinoLogger));
  // ==============================

  // ===== Swagger en /api =====
  const config = new DocumentBuilder()
    .setTitle('KantarEs API')
    .setDescription('API REST de KantarEs')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'KantarEs API',
  });

  const server: any = app.getHttpServer();
  if (!server.listening) {
    await app.listen(3000);
    console.log(`🚀 Servidor corriendo en: http://localhost:3000`);
    console.log(`📚 Documentación Swagger: http://localhost:3000/api`);
    console.log('=================================');
  }
}

if (require.main === module) {
  bootstrap();
}
