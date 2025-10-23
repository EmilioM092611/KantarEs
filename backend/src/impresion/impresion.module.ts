// backend/src/impresion/impresion.module.ts

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ImpresionController } from './impresion.controller';
import { ImpresionService } from './impresion.service';
import { ImpresionProcessor } from './processors/impresion.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'impresion',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: false, // Mantener historial
        removeOnFail: false,
      },
    }),
  ],
  controllers: [ImpresionController],
  providers: [ImpresionService, ImpresionProcessor],
  exports: [ImpresionService], // Exportar para usar en otros módulos
})
export class ImpresionModule {}
