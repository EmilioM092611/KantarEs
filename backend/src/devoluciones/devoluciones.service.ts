import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevolucionesService {
  constructor(private readonly prisma: PrismaService) {}

  // DEVOLUCIÓN DE VENTA: usa orden_detalle.id_detalle
  devolucionVenta(dto: {
    id_orden: number;
    items: {
      id_orden_detalle: number;
      cantidad: string | number;
      motivo?: string;
    }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const orden = await tx.ordenes.findUnique({
        where: { id_orden: dto.id_orden },
        include: { orden_detalle: true },
      });
      if (!orden) throw new BadRequestException('Orden no encontrada');

      for (const it of dto.items ?? []) {
        const od = orden.orden_detalle.find(
          (o) => o.id_detalle === it.id_orden_detalle,
        );
        if (!od)
          throw new BadRequestException('Detalle no pertenece a la orden');
        if (Number(it.cantidad) > Number(od.cantidad))
          throw new BadRequestException('Cantidad excede lo vendido');

        // Si necesitas mover inventario aquí, debes conocer:
        // id_tipo_movimiento, id_usuario y la unidad del producto.
        // De momento solo ajusto la línea:
        await tx.orden_detalle.update({
          where: { id_detalle: od.id_detalle },
          data: {
            cantidad: (Number(od.cantidad) - Number(it.cantidad)) as any,
            motivo_cancelacion: it.motivo ?? null,
          },
        });
      }

      return { ok: true, id_orden: dto.id_orden };
    });
  }

  // DEVOLUCIÓN DE COMPRA: usa compra_detalle.id_detalle y cantidades *recibidas*
  devolucionCompra(dto: {
    id_compra: number;
    items: {
      id_compra_detalle: number;
      cantidad: string | number;
      motivo?: string;
    }[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const compra = await tx.compras.findUnique({
        where: { id_compra: dto.id_compra },
        include: { compra_detalle: true },
      });
      if (!compra) throw new BadRequestException('Compra no encontrada');

      for (const it of dto.items ?? []) {
        const cd = compra.compra_detalle.find(
          (c) => c.id_detalle === it.id_compra_detalle,
        );
        if (!cd)
          throw new BadRequestException('Detalle no pertenece a la compra');
        const recibida = Number(cd.cantidad_recibida ?? 0);
        if (Number(it.cantidad) > recibida)
          throw new BadRequestException('Cantidad excede lo recibido');

        // Ajuste en detalle: reducir cantidad_recibida (o agrega registro de devolución si prefieres)
        await tx.compra_detalle.update({
          where: { id_detalle: cd.id_detalle },
          data: {
            cantidad_recibida: (recibida - Number(it.cantidad)) as any,
            observaciones: it.motivo ?? cd.observaciones,
          },
        });
      }

      return { ok: true, id_compra: dto.id_compra };
    });
  }
}
