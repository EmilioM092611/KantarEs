import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FolioService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera folio atómico para órdenes usando secuencia PostgreSQL
   * Formato: ORD-{sucursal}-{YYMMDD}-{consecutivo}
   */
  async generarFolioOrden(sucursal = '001'): Promise<string> {
    return this.prisma.$transaction(async (tx) => {
      // Obtener siguiente valor de la secuencia
      const [{ nextval }] = await tx.$queryRaw<[{ nextval: bigint }]>`
        SELECT nextval('seq_folio_orden')
      `;

      const fecha = new Date();
      const year = fecha.getFullYear().toString().substr(-2);
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');

      return `ORD-${sucursal}-${year}${month}${day}-${nextval.toString().padStart(6, '0')}`;
    });
  }

  /**
   * Genera folio atómico para pagos usando secuencia PostgreSQL
   * Formato: PAG-{YYMMDD}-{consecutivo}
   */
  async generarFolioPago(): Promise<string> {
    return this.prisma.$transaction(async (tx) => {
      // Obtener siguiente valor de la secuencia
      const [{ nextval }] = await tx.$queryRaw<[{ nextval: bigint }]>`
        SELECT nextval('seq_folio_pago')
      `;

      const fecha = new Date();
      const year = fecha.getFullYear().toString().substr(-2);
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');

      return `PAG-${year}${month}${day}-${nextval.toString().padStart(6, '0')}`;
    });
  }

  /**
   * Genera folio para cortes de caja
   */
  async generarFolioCorte(tipoCorte = 'Z'): Promise<string> {
    return this.prisma.$transaction(async (tx) => {
      const [{ nextval }] = await tx.$queryRaw<[{ nextval: bigint }]>`
        SELECT nextval('seq_folio_corte')
      `;

      const fecha = new Date();
      const year = fecha.getFullYear().toString().substr(-2);
      const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const day = fecha.getDate().toString().padStart(2, '0');

      return `CRT-${tipoCorte}-${year}${month}${day}-${nextval.toString().padStart(4, '0')}`;
    });
  }
}
