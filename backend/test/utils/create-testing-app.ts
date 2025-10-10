// test/utils/create-testing-app.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { GlobalHttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

// Evitamos usar PinoLogger / interceptores en e2e para no chocar con el Logger interno de Nest.
export async function createTestingApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  // Desactivamos el logger en tests para evitar "this.localInstance?.log is not a function"
  app.useLogger(false);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  await app.init();
  return app;
}
