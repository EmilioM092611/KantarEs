import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, PassportModule],
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService],
})
export class InventarioModule {}
