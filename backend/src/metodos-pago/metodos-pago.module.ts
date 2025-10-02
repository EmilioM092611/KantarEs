import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MetodosPagoController } from './metodos-pago.controller';
import { MetodosPagoService } from './metodos-pago.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, PassportModule],
  controllers: [MetodosPagoController],
  providers: [MetodosPagoService],
  exports: [MetodosPagoService],
})
export class MetodosPagoModule {}
