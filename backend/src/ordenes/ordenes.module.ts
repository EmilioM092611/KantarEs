// ============== ordenes/ordenes.module.ts ==============
import { Module } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FolioService } from './services/folio.service';
import { KdsModule } from '../kds/kds.module';

@Module({
  imports: [PrismaModule, KdsModule],
  controllers: [OrdenesController],
  providers: [OrdenesService, FolioService],
  exports: [OrdenesService, FolioService],
})
export class OrdenesModule {}
