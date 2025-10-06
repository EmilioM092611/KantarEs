// src/cfdi/cfdi.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PacProvider } from './pac/pac.provider';
import { CancelarCfdiDto } from './dto/cancelar-cfdi.dto';
import { buildCfdi40Xml } from './xml/cfdi40-builder';

@Injectable()
export class CfdiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pac: PacProvider,
  ) {}

  // -------- Receptores --------
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

  // -------- Timbrado --------
  async facturarOrden(
    id_orden: number,
    dto: {
      id_receptor: number;
      serie?: string;
      folio?: string;
      tipo?: 'I' | 'P' | 'E';
      xml?: string;
    },
  ) {
    const [orden, receptor] = await Promise.all([
      this.prisma.ordenes.findUnique({
        where: { id_orden },
        include: { orden_detalle: { include: { productos: true } } },
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

    // Si no envían XML, lo generamos mínimo
    let xmlReady = dto.xml ?? null;
    if (!xmlReady) {
      xmlReady = buildCfdi40Xml({
        serie: dto.serie ?? undefined,
        folio: dto.folio ?? undefined,
        tipo: dto.tipo ?? 'I',
        emisor: {
          rfc: process.env.CFDI_EMISOR_RFC!,
          nombre: process.env.CFDI_EMISOR_NOMBRE!,
          regimen: process.env.CFDI_EMISOR_REGIMEN!,
          lugarExpedicion: process.env.CFDI_LUGAR_EXPEDICION!,
        },
        receptor: {
          rfc: receptor.rfc,
          nombre: receptor.razon_social,
          usoCfdi: receptor.uso_cfdi,
        },
        conceptos: orden.orden_detalle.map((d) => ({
          descripcion: d.productos?.nombre ?? `Producto ${d.id_producto}`,
          cantidad: Number(d.cantidad ?? 1),
          precioUnitario: Number(d.precio_unitario ?? 0),
          importe: Number(
            d.subtotal ??
              Number(d.precio_unitario ?? 0) * Number(d.cantidad ?? 1),
          ),
          // TODO: sustituir por claves SAT reales:
          claveProdServ: '01010101',
          claveUnidad: 'H87',
        })),
        subtotal,
        total,
      });
    }

    const borrador = await this.prisma.cfdi_comprobantes.create({
      data: {
        id_orden,
        id_receptor: receptor.id_receptor,
        tipo: (dto.tipo ?? 'I') as any,
        serie: dto.serie ?? null,
        folio: dto.folio ?? null,
        subtotal: subtotal as any,
        total: total as any,
        estatus: 'pendiente',
        xml: xmlReady,
      },
    });

    try {
      const { uuid, xml } = await this.pac.timbrar({ xml: borrador.xml ?? '' });
      const timbrado = await this.prisma.cfdi_comprobantes.update({
        where: { id_cfdi: borrador.id_cfdi },
        data: { uuid, xml, estatus: 'timbrado' },
      });
      return timbrado;
    } catch (e: any) {
      await this.prisma.cfdi_comprobantes.update({
        where: { id_cfdi: borrador.id_cfdi },
        data: { estatus: 'error', error_msg: e?.message ?? 'Error al timbrar' },
      });
      throw new BadRequestException(e?.message ?? 'Error al timbrar');
    }
  }

  // -------- Cancelación --------
  async cancelarPorId(id_cfdi: number, dto: CancelarCfdiDto) {
    const cfdi = await this.prisma.cfdi_comprobantes.findUnique({
      where: { id_cfdi },
    });
    if (!cfdi) throw new NotFoundException('CFDI no encontrado');
    if (cfdi.estatus !== 'timbrado' || !cfdi.uuid) {
      throw new BadRequestException('El CFDI no está timbrado');
    }
    return this.cancelarUuid(cfdi.uuid, dto, id_cfdi);
  }

  async cancelarUuid(uuid: string, dto: CancelarCfdiDto, id_cfdi?: number) {
    // localizar registro para obtener id_cfdi (update exige clave única)
    const cfdi = id_cfdi
      ? await this.prisma.cfdi_comprobantes.findUnique({ where: { id_cfdi } })
      : await this.prisma.cfdi_comprobantes.findFirst({ where: { uuid } });
    if (!cfdi) throw new NotFoundException('CFDI no encontrado');

    try {
      const { ok, acuse } = await this.pac.cancelar(uuid, dto);
      if (!ok) throw new Error('PAC no canceló');

      const updated = await this.prisma.cfdi_comprobantes.update({
        where: { id_cfdi: cfdi.id_cfdi },
        data: {
          estatus: 'cancelado' as any,
          // Estos campos requieren que hayas hecho el db pull del patch SQL
          fecha_cancelacion: new Date() as any,
          acuse_cancelacion: (acuse ?? null) as any,
          motivo_cancelacion: (dto.motivo ?? null) as any,
          uuid_relacionado: (dto.uuid_relacionado ?? null) as any,
        },
      });
      return { ok: true, id_cfdi: updated.id_cfdi, uuid: updated.uuid };
    } catch (e: any) {
      await this.prisma.cfdi_comprobantes.update({
        where: { id_cfdi: cfdi.id_cfdi },
        data: { error_msg: e?.message ?? 'Error al cancelar' } as any,
      });
      throw new BadRequestException(e?.message ?? 'Error al cancelar');
    }
  }

  // -------- Listado y descargas --------
  listar(where: any) {
    return this.prisma.cfdi_comprobantes.findMany({
      where,
      include: { cfdi_receptores: true }, // ajusta si tu relación se llama diferente
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }

  async getXml(id_cfdi: number) {
    const cfdi = await this.prisma.cfdi_comprobantes.findUnique({
      where: { id_cfdi },
    });
    if (!cfdi) throw new NotFoundException('CFDI no encontrado');
    if (!cfdi.xml) throw new NotFoundException('Sin XML almacenado');
    return { xml: cfdi.xml, uuid: cfdi.uuid };
  }

  async getAcuse(id_cfdi: number) {
    const cfdi = await this.prisma.cfdi_comprobantes.findUnique({
      where: { id_cfdi },
    });
    if (!cfdi) throw new NotFoundException('CFDI no encontrado');
    const acuse = (cfdi as any).acuse_cancelacion ?? null;
    if (!acuse) throw new NotFoundException('Sin acuse de cancelación');
    return { acuse, uuid: cfdi.uuid };
  }
}
