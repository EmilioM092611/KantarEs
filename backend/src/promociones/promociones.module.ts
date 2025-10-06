import { Module } from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { PromocionesController } from './promociones.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PromocionesController],
  providers: [PromocionesService],
  exports: [PromocionesService], // Exportar para usar en otros módulos (como Ordenes)
})
export class PromocionesModule {}
