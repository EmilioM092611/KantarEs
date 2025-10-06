import { Module } from '@nestjs/common';
import { TurnosCajaController } from './turnos-caja.controller';
import { TurnosCajaService } from './turnos-caja.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TurnosCajaController],
  providers: [TurnosCajaService, PrismaService],
})
export class TurnosCajaModule {}
