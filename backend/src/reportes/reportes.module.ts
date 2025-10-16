import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { RefreshMvJob } from './jobs/refresh-mv.job';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Habilita el sistema de tareas programadas
  ],
  controllers: [ReportesController],
  providers: [ReportesService, PrismaService, RefreshMvJob],
  exports: [ReportesService],
})
export class ReportesModule {}
