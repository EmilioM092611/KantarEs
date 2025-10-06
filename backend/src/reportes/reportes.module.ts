import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ReportesController],
  providers: [ReportesService, PrismaService],
})
export class ReportesModule {}
