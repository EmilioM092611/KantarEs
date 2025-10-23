/* eslint-disable @typescript-eslint/no-floating-promises */
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { SwaggerTheme } from 'swagger-themes'; // <-- sin tipos extra

// === Agregados (hardening) ===
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestLoggerInterceptor } from './common/logging/request-logger.interceptor';
import { PinoLogger } from 'nestjs-pino';

// ============================================
// ✅ DECLARACIÓN DE TIPO PARA BigInt.toJSON
// ============================================
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

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
  // ============================================
  // ✅ FIX CRÍTICO: Serialización de BigInt a JSON
  // ============================================
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

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
  app.useGlobalFilters(new HttpExceptionFilter());

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

  // --- Tema oscuro con swagger-themes ---
  // ⚠️ En 1.4.3 NO se debe pasar 'v3' al constructor (deprecado).
  const theme = new SwaggerTheme();

  // Tipado defensivo para cubrir diferencias entre versiones (getBuffer vs getStyles)
  let cssDark: unknown;
  if (typeof (theme as any).getBuffer === 'function') {
    cssDark = (theme as any).getBuffer('dark' as any);
  } else if (typeof (theme as any).getStyles === 'function') {
    cssDark = (theme as any).getStyles('dark' as any);
  } else {
    cssDark = '';
  }
  const cssDarkStr = typeof cssDark === 'string' ? cssDark : String(cssDark);

  // ...deja todo igual y solo cambia el setup para sumar CSS:
  SwaggerModule.setup('api', app, document, {
    customCss:
      cssDarkStr +
      `
/* Candados en las filas de endpoints */
.swagger-ui .authorization__btn.locked svg,
.swagger-ui .opblock-summary .authorization__btn.locked svg {
  color:#f59e0b !important;      /* ámbar */
  fill:#f59e0b !important;
  opacity:1 !important;
}
.swagger-ui .authorization__btn.unlocked svg,
.swagger-ui .opblock-summary .authorization__btn.unlocked svg {
  color:#22c55e !important;      /* verde */
  fill:#22c55e !important;
  opacity:1 !important;
}

/* Por si el SVG no hereda color, cubrimos paths también */
.swagger-ui .authorization__btn svg path { fill: currentColor !important; }

/* (Opcional) Botón “Authorize” de la barra superior */
.swagger-ui .btn.authorize svg { color:#22c55e !important; fill:#22c55e !important; }
    `,
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
