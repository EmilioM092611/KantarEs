// ============== orden-detalle.module.ts ==============
import { Module } from '@nestjs/common';
import { OrdenDetalleService } from './orden-detalle.service';
import { OrdenDetalleController } from './orden-detalle.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OrdenDetalleController],
  providers: [OrdenDetalleService],
  exports: [OrdenDetalleService],
})
export class OrdenDetalleModule {}
