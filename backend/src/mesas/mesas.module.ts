// ============== mesas.module.ts ==============
import { Module } from '@nestjs/common';
import { MesasService } from './mesas.service';
import { MesasController } from './mesas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MesasController],
  providers: [MesasService],
  exports: [MesasService], // Exportar para usar en sesiones-mesa
})
export class MesasModule {}
