import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Debug: Verificar que las variables de entorno se cargaron
  console.log('=== Verificación de configuración ===');
  console.log(
    'JWT_SECRET cargado:',
    process.env.JWT_SECRET ? '✅ SÍ' : '❌ NO',
  );
  console.log(
    'DATABASE_URL:',
    process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada',
  );
  console.log('Entorno:', process.env.NODE_ENV || 'development');

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: 'http://localhost:3002',
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('KantarEs API')
    .setDescription('Sistema ERP para Restaurante KantarEs')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa el token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`🚀 Servidor corriendo en: http://localhost:3000`);
  console.log(`📚 Documentación Swagger: http://localhost:3000/api`);
  console.log('=================================');
}
bootstrap();
