import { Module } from '@nestjs/common';
import { DevolucionesController } from './devoluciones.controller';
import { DevolucionesService } from './devoluciones.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DevolucionesController],
  providers: [DevolucionesService, PrismaService],
})
export class DevolucionesModule {}
