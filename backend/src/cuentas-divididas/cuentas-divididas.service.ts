import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SplitPago {
  id_metodo_pago: number; // requerido por tu modelo pagos
  monto: string | number;
  id_usuario_cobra?: number; // si no lo envían, usaré al mesero
  referencia_transaccion?: string;
}
interface SplitGrupoItem {
  orden_detalle_id: number; // -> orden_detalle.id_detalle
  cantidad: string | number;
}
interface SplitDto {
  grupos?: Array<{
    items?: SplitGrupoItem[];
    pagos?: SplitPago[];
  }>;
}

function genFolioPago(): string {
  return `SPL-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

@Injectable()
export class CuentasDivididasService {
  constructor(private readonly prisma: PrismaService) {}

  async splitOrden(id_orden: number, dto: SplitDto) {
    return this.prisma.$transaction(async (tx) => {
      const orden = await tx.ordenes.findUnique({
        where: { id_orden },
        include: { orden_detalle: true }, // PK: id_detalle
      });
      if (!orden) throw new BadRequestException('Orden no encontrada');

      // 1) Sumar cantidades a dividir por cada detalle
      const cantidadesMap = new Map<number, number>();
      for (const g of dto?.grupos ?? []) {
        for (const it of g.items ?? []) {
          const sum =
            (cantidadesMap.get(it.orden_detalle_id) ?? 0) + Number(it.cantidad);
          cantidadesMap.set(it.orden_detalle_id, sum);
        }
      }

      // 2) Validar que no se exceda lo vendido
      for (const [odId, sum] of cantidadesMap.entries()) {
        const od = orden.orden_detalle.find((o) => o.id_detalle === odId);
        if (!od || Number(od.cantidad) < sum) {
          throw new BadRequestException(
            'Cantidad a dividir excede la original',
          );
        }
      }

      // 3) (Opcional) Crear pagos por grupo con el modelo real "pagos"
      for (const g of dto?.grupos ?? []) {
        for (const p of g.pagos ?? []) {
          await tx.pagos.create({
            data: {
              folio_pago: genFolioPago(),
              id_orden,
              id_metodo_pago: Number(p.id_metodo_pago),
              id_usuario_cobra: Number(
                p.id_usuario_cobra ?? orden.id_usuario_mesero,
              ),
              monto: (p.monto ?? '0') as any,
              fecha_hora_pago: new Date(),
              referencia_transaccion: p.referencia_transaccion ?? 'SPLIT',
            },
          });
        }
      }

      // 4) Ajustar líneas: restar a la original y crear línea separada marcada como SPLIT
      for (const [odId, sum] of cantidadesMap.entries()) {
        const od = orden.orden_detalle.find((o) => o.id_detalle === odId)!;
        if (Number(od.cantidad) === sum) continue;

        await tx.orden_detalle.update({
          where: { id_detalle: odId },
          data: { cantidad: (Number(od.cantidad) - sum) as any },
        });

        await tx.orden_detalle.create({
          data: {
            id_orden,
            id_producto: od.id_producto,
            cantidad: sum as any,
            precio_unitario: od.precio_unitario,
            estado: od.estado,
            notas_especiales: 'SPLIT',
            subtotal: od.subtotal, // ajusta si recalculas
            iva_monto: od.iva_monto, // idem
            ieps_monto: od.ieps_monto, // idem
            total: od.total, // idem
          },
        });
      }

      return { ok: true, id_orden };
    });
  }
}
