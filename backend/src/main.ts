/* eslint-disable @typescript-eslint/no-floating-promises */
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

export async function bootstrap() {
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

  // Filtro Prisma → HTTP
  app.useGlobalFilters(new PrismaExceptionFilter());

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
