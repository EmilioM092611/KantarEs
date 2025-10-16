// backend/src/estados-orden/estados-orden.module.ts
import { Module } from '@nestjs/common';
import { EstadosOrdenController } from './estados-orden.controller';
import { EstadosOrdenService } from './estados-orden.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EstadosOrdenController],
  providers: [EstadosOrdenService],
  exports: [EstadosOrdenService], // Exportar para usar en OrdenesModule y otros
})
export class EstadosOrdenModule {}
