import { Module } from '@nestjs/common';
import { ReservacionesController } from './reservaciones.controller';
import { ReservacionesService } from './reservaciones.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ReservacionesController],
  providers: [ReservacionesService, PrismaService],
  exports: [ReservacionesService],
})
export class ReservacionesModule {}
