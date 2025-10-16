// backend/src/tipos-producto/tipos-producto.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TiposProductoController } from './tipos-producto.controller';
import { TiposProductoService } from './tipos-producto.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, PassportModule],
  controllers: [TiposProductoController],
  providers: [TiposProductoService],
  exports: [TiposProductoService],
})
export class TiposProductoModule {}
