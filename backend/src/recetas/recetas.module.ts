// backend/src/productos/recetas/recetas.module.ts
import { Module } from '@nestjs/common';
import { RecetasController } from './recetas.controller';
import { RecetasService } from './recetas.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecetasController],
  providers: [RecetasService],
  exports: [RecetasService],
})
export class RecetasModule {}
