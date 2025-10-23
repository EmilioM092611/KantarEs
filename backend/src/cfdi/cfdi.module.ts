// src/cfdi/cfdi.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CfdiController } from './cfdi.controller';
import { CfdiService } from './cfdi.service';
import { PrismaService } from '../prisma/prisma.service';
import { PacProvider } from './pac/pac.provider';
import { NullPacProvider } from './pac/null-pac.provider';
import { RealPacProvider } from './pac/real-pac.provider';

// FASE 5: Validación XSD
import { XsdValidatorService } from './validation/xsd-validator.service';

// FASE 6: Reportes Fiscales
import { ReportesController } from './reportes/reportes.controller';
import { ReportesService } from './reportes/reportes.service';
import { ExcelGeneratorService } from './reportes/excel/excel-generator.service';

// FASE 7: Relaciones de CFDIs
import { RelacionesService } from './relaciones/relaciones.service';

@Module({
  imports: [HttpModule],
  controllers: [
    CfdiController,
    ReportesController, // <-- NUEVO: Controlador de reportes (Fase 6)
  ],
  providers: [
    CfdiService,
    PrismaService,
    // Elegir proveedor PAC por ENV (mock | real)
    {
      provide: PacProvider,
      useClass:
        (process.env.PAC_PROVIDER ?? 'mock') === 'real'
          ? RealPacProvider
          : NullPacProvider,
    },
    // FASE 5: Servicio de validación XSD
    XsdValidatorService,
    // FASE 6: Servicios de reportes
    ReportesService,
    ExcelGeneratorService,
    // FASE 7: Servicio de relaciones (notas de crédito, complementos de pago)
    RelacionesService,
  ],
  exports: [CfdiService],
})
export class CfdiModule {}
