import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InventarioModule } from '../inventario/inventario.module';

@Module({
  imports: [PrismaModule, PassportModule, InventarioModule],
  controllers: [ComprasController],
  providers: [ComprasService],
  exports: [ComprasService],
})
export class ComprasModule {}
