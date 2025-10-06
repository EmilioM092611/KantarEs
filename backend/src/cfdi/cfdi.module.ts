import { Module } from '@nestjs/common';
import { CfdiController } from './cfdi.controller';
import { CfdiService } from './cfdi.service';
import { PrismaService } from '../prisma/prisma.service';
import { PacProvider } from './pac/pac.provider';
import { NullPacProvider } from './pac/null-pac.provider';

@Module({
  controllers: [CfdiController],
  providers: [
    CfdiService,
    PrismaService,
    { provide: PacProvider, useClass: NullPacProvider },
  ],
  exports: [CfdiService],
})
export class CfdiModule {}
