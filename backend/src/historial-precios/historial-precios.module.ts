import { Module } from '@nestjs/common';
import { HistorialPreciosService } from './historial-precios.service';
import { HistorialPreciosController } from './historial-precios.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HistorialPreciosController],
  providers: [HistorialPreciosService],
  exports: [HistorialPreciosService], // Exportar para usar en módulo de productos
})
export class HistorialPreciosModule {}
