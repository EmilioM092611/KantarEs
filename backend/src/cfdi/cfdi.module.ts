import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CfdiController } from './cfdi.controller';
import { CfdiService } from './cfdi.service';
import { PrismaService } from '../prisma/prisma.service';
import { PacProvider } from './pac/pac.provider';
import { NullPacProvider } from './pac/null-pac.provider';
import { RealPacProvider } from './pac/real-pac.provider';

@Module({
  imports: [HttpModule],
  controllers: [CfdiController],
  providers: [
    CfdiService,
    PrismaService,
    // Elegir proveedor por ENV (mock | real)
    {
      provide: PacProvider,
      useClass:
        (process.env.PAC_PROVIDER ?? 'mock') === 'real'
          ? RealPacProvider
          : NullPacProvider,
    },
  ],
  exports: [CfdiService],
})
export class CfdiModule {}
