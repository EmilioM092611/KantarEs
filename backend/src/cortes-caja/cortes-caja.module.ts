import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CortesCajaController } from './cortes-caja.controller';
import { CortesCajaService } from './cortes-caja.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TiposCorteModule } from '../tipos-corte/tipos-corte.module';
import { PagosModule } from '../pagos/pagos.module';

@Module({
  imports: [PrismaModule, PassportModule, TiposCorteModule, PagosModule],
  controllers: [CortesCajaController],
  providers: [CortesCajaService],
  exports: [CortesCajaService],
})
export class CortesCajaModule {}
