// backend/src/kds/kds.module.ts

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { KdsController } from './kds.controller';
import { KdsService } from './kds.service';
import { KdsGateway } from './kds.gateway';
import { TemporizadorService } from './services/temporizador.service';
import { EstadisticasService } from './services/estadisticas.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [KdsController],
  providers: [
    KdsService,
    KdsGateway,
    TemporizadorService,
    EstadisticasService,
    PrismaService,
  ],
  exports: [KdsService, KdsGateway],
})
export class KdsModule {}
