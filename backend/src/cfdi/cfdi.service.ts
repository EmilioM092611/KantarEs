// /src/cfdi/cfdi.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PacProvider } from './pac/pac.provider';

@Injectable()
export class CfdiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pac: PacProvider,
  ) {}

  crearReceptor(dto: {
    rfc: string;
    razon_social: string;
    regimen_fiscal: string;
    uso_cfdi: string;
    email?: string;
  }) {
    return this.prisma.cfdi_receptores.create({
      data: {
        rfc: dto.rfc.toUpperCase(),
        razon_social: dto.razon_social,
        regimen_fiscal: dto.regimen_fiscal,
        uso_cfdi: dto.uso_cfdi,
        email: dto.email ?? null,
      },
    });
  }

  buscarReceptores(q?: string) {
    if (!q) {
      return this.prisma.cfdi_receptores.findMany({
        orderBy: { created_at: 'desc' },
      });
    }
    const like = q.trim();
    return this.prisma.cfdi_receptores.findMany({
      where: {
        OR: [
          { rfc: { contains: like, mode: 'insensitive' } },
          { razon_social: { contains: like, mode: 'insensitive' } },
        ],
      },
      take: 50,
      orderBy: { razon_social: 'asc' },
    });
  }

  async facturarOrden(
    id_orden: number,
    dto: {
      id_receptor: number;
      serie?: string;
      folio?: string;
      tipo?: 'I' | 'P' | 'E';
    },
  ) {
    const [orden, receptor] = await Promise.all([
      this.prisma.ordenes.findUnique({
        where: { id_orden },
        include: { orden_detalle: true },
      }),
      this.prisma.cfdi_receptores.findUnique({
        where: { id_receptor: Number(dto.id_receptor) },
      }),
    ]);

    if (!orden) throw new NotFoundException('Orden no encontrada');
    if (!receptor) throw new NotFoundException('Receptor no encontrado');

    const subtotal = orden.orden_detalle.reduce(
      (a, d) => a + Number(d.subtotal ?? 0),
      0,
    );
    const total = Number(orden.total ?? subtotal);

    // 1) Crear registro en estado pendiente
    const borrador = await this.prisma.cfdi_comprobantes.create({
      data: {
        id_orden,
        id_receptor: receptor.id_receptor,
        tipo: (dto.tipo ?? 'I') as any, // I=Ingreso, P=Pago, E=Egreso
        serie: dto.serie ?? null,
        folio: dto.folio ?? null,
        subtotal: subtotal as any,
        total: total as any,
        estatus: 'pendiente',
      },
    });

    // 2) Timbrar con PAC (mock por defecto)
    try {
      const { uuid, xml } = await this.pac.timbrar({
        serie: borrador.serie,
        folio: borrador.folio,
        total,
        receptor,
        orden,
      });

      const timbrado = await this.prisma.cfdi_comprobantes.update({
        where: { id_cfdi: borrador.id_cfdi },
        data: {
          uuid,
          xml,
          estatus: 'timbrado',
        },
      });

      return timbrado;
    } catch (e: any) {
      await this.prisma.cfdi_comprobantes.update({
        where: { id_cfdi: borrador.id_cfdi },
        data: {
          estatus: 'error',
          error_msg: e?.message ?? 'Error al timbrar',
        },
      });
      throw new BadRequestException(e?.message ?? 'Error al timbrar');
    }
  }
}
