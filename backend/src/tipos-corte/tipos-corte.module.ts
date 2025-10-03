import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TiposCorteController } from './tipos-corte.controller';
import { TiposCorteService } from './tipos-corte.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, PassportModule],
  controllers: [TiposCorteController],
  providers: [TiposCorteService],
  exports: [TiposCorteService],
})
export class TiposCorteModule {}
