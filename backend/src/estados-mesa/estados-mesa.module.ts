// backend/src/estados-mesa/estados-mesa.module.ts
import { Module } from '@nestjs/common';
import { EstadosMesaController } from './estados-mesa.controller';
import { EstadosMesaService } from './estados-mesa.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EstadosMesaController],
  providers: [EstadosMesaService],
  exports: [EstadosMesaService], // Exportar para usar en MesasModule
})
export class EstadosMesaModule {}
