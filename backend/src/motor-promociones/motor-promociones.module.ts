import { Module } from '@nestjs/common';
import { MotorPromocionesController } from './motor-promociones.controller';
import { MotorPromocionesService } from './motor-promociones.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MotorPromocionesController],
  providers: [MotorPromocionesService, PrismaService],
  exports: [MotorPromocionesService],
})
export class MotorPromocionesModule {}
