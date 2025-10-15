import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdenesModule } from '../ordenes/ordenes.module';
import { MetodosPagoModule } from '../metodos-pago/metodos-pago.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    OrdenesModule,
    MetodosPagoModule,
    EventEmitterModule,
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
