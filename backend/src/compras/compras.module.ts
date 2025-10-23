import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ComprasController } from './compras.controller';
import { ComprasService } from './compras.service';
import { ComparadorProveedoresService } from './comparador-proveedores.service';
import { AlertasReordenService } from './alertas-reorden.service';
import { SugerenciasCompraService } from './sugerencias-compra.service';
import { CuentasPagarService } from './cuentas-pagar.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InventarioModule } from '../inventario/inventario.module';

@Module({
  imports: [PrismaModule, PassportModule, InventarioModule],
  controllers: [ComprasController],
  providers: [
    ComprasService,
    ComparadorProveedoresService,
    AlertasReordenService,
    SugerenciasCompraService,
    CuentasPagarService,
  ],
  exports: [
    ComprasService,
    ComparadorProveedoresService,
    AlertasReordenService,
    SugerenciasCompraService,
    CuentasPagarService,
  ],
})
export class ComprasModule {}
