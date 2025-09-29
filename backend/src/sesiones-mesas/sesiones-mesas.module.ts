import { Module } from '@nestjs/common';
import { SesionesMesaService } from './sesiones-mesas.service';
import { SesionesMesaController } from './sesiones-mesas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SesionesMesaController],
  providers: [SesionesMesaService],
  exports: [SesionesMesaService],
})
export class SesionesMesaModule {}
