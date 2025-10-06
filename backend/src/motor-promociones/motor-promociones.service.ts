/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type TipoPromocion =
  | 'descuento_porcentaje'
  | 'descuento_monto'
  | '2x1'
  | '3x2'
  | 'precio_fijo'
  | 'combo';

type Aplicacion = 'producto' | 'categoria' | 'total_cuenta';

function parseDiasSemana(val?: string | null) {
  if (!val) return null;
  const nums = val
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
  return nums.length ? new Set(nums) : null;
}
function enVigencia(now: Date, ini?: Date | null, fin?: Date | null) {
  if (ini && now < ini) return false;
  if (fin && now > fin) return false;
  return true;
}
function enHorario(now: Date, hIni?: string | null, hFin?: string | null) {
  if (!hIni && !hFin) return true;
  const hhmm = now.toTimeString().slice(0, 5);
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const n = toMin(hhmm),
    a = hIni ? toMin(hIni) : 0,
    b = hFin ? toMin(hFin) : 24 * 60;
  return n >= a && n <= b;
}

@Injectable()
export class MotorPromocionesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrden(id_orden: number) {
    const orden = await this.prisma.ordenes.findUnique({
      where: { id_orden },
      include: { orden_detalle: { include: { productos: true } } },
    });
    if (!orden) throw new NotFoundException('Orden no encontrada');
    return orden;
  }

  private async getPromosActivas() {
    return this.prisma.promociones.findMany({
      where: { activa: true },
      orderBy: { created_at: 'desc' },
    });
  }

  private async getTargets(id_promocion: number) {
    const list = await this.prisma.producto_promocion.findMany({
      where: { id_promocion },
      select: {
        id_producto: true,
        id_categoria: true,
        precio_especial: true,
        cantidad_requerida: true,
        cantidad_bonificada: true,
      },
    });
    const prod = new Map<number, any>(),
      cat = new Map<number, any>();
    for (const r of list) {
      if (r.id_producto) prod.set(r.id_producto, r);
      if (r.id_categoria) cat.set(r.id_categoria, r);
    }
    return { prod, cat };
  }

  private matchesDia(dias: Set<number> | null, now: Date) {
    if (!dias) return true;
    const dow0 = now.getDay();
    return dias.has(dow0) || dias.has((dow0 + 1) % 7 || 7);
  }

  private baseAplicable(
    promo: any,
    orden: any,
    targets: { prod: Map<number, any>; cat: Map<number, any> },
  ) {
    const now = new Date();
    if (!enVigencia(now, promo.fecha_inicio, promo.fecha_fin)) return false;
    if (!enHorario(now, promo.hora_inicio as any, promo.hora_fin as any))
      return false;
    if (!this.matchesDia(parseDiasSemana(promo.dias_semana), now)) return false;

    const cantTotal = orden.orden_detalle.reduce(
      (a: number, d: any) => a + Number(d.cantidad ?? 0),
      0,
    );
    const subtotal = orden.orden_detalle.reduce(
      (a: number, d: any) => a + Number(d.subtotal ?? 0),
      0,
    );

    if (
      promo.condicion_cantidad_minima &&
      cantTotal < Number(promo.condicion_cantidad_minima)
    )
      return false;
    if (
      promo.condicion_monto_minimo &&
      subtotal < Number(promo.condicion_monto_minimo)
    )
      return false;

    if (promo.aplicacion === 'total_cuenta') return true;

    const anyTarget = orden.orden_detalle.some((d: any) => {
      if (promo.aplicacion === 'producto')
        return targets.prod.has(d.id_producto);
      if (promo.aplicacion === 'categoria')
        return targets.cat.has(d.productos?.id_categoria);
      return false;
    });
    return anyTarget;
  }

  private calcularDescuento(
    promo: any,
    orden: any,
    targets: { prod: Map<number, any>; cat: Map<number, any> },
  ) {
    const tipo: TipoPromocion = promo.tipo;
    const aplicacion: Aplicacion = promo.aplicacion;
    const valor = Number(promo.valor ?? 0);

    const lineasAplicables = orden.orden_detalle.filter((d: any) => {
      if (aplicacion === 'total_cuenta') return true;
      if (aplicacion === 'producto') return targets.prod.has(d.id_producto);
      if (aplicacion === 'categoria')
        return targets.cat.has(d.productos?.id_categoria);
      return false;
    });

    const subtotalAplicable = lineasAplicables.reduce(
      (a: number, d: any) => a + Number(d.subtotal ?? 0),
      0,
    );

    if (tipo === 'descuento_porcentaje')
      return +((subtotalAplicable * valor) / 100).toFixed(2);
    if (tipo === 'descuento_monto') return Math.min(valor, subtotalAplicable);

    if (tipo === '2x1' || tipo === '3x2') {
      const n = tipo === '2x1' ? 2 : 3;
      const bonificada = 1; // 2x1 y 3x2 bonifican 1 por bloque
      let desc = 0;
      for (const d of lineasAplicables) {
        const qty = Math.floor(Number(d.cantidad) / n) * bonificada;
        desc += qty * Number(d.precio_unitario ?? 0);
      }
      return +desc.toFixed(2);
    }

    if (tipo === 'precio_fijo') {
      let desc = 0;
      for (const d of lineasAplicables) {
        const t =
          aplicacion === 'producto'
            ? targets.prod.get(d.id_producto)
            : targets.cat.get(d.productos?.id_categoria);
        const precioEspecial =
          t?.precio_especial != null ? Number(t.precio_especial) : null;
        if (precioEspecial != null) {
          const diff = Math.max(0, Number(d.precio_unitario) - precioEspecial);
          desc += diff * Number(d.cantidad);
        }
      }
      return +desc.toFixed(2);
    }

    // combo: a definir en una segunda vuelta
    return 0;
  }

  async promosAplicablesOrden(id_orden: number) {
    const orden = await this.getOrden(id_orden);
    const promos = await this.getPromosActivas();

    const result: any[] = [];
    for (const p of promos) {
      const targets = await this.getTargets(p.id_promocion);
      if (!this.baseAplicable(p, orden, targets)) continue;
      const descuento = this.calcularDescuento(p, orden, targets);
      if (descuento > 0) {
        result.push({
          id_promocion: p.id_promocion,
          nombre: p.nombre,
          tipo: p.tipo,
          aplicacion: p.aplicacion,
          valor: p.valor,
          combinable: !!p.combinable,
          requiere_codigo: !!p.requiere_codigo,
          codigo_promocion: p.codigo_promocion ?? null,
          descuento,
        });
      }
    }
    result.sort((a, b) => b.descuento - a.descuento);
    return { id_orden, aplicables: result };
  }

  async aplicarPromocion(
    id_orden: number,
    dto: { id_promocion?: number; codigo?: string },
  ) {
    const orden = await this.getOrden(id_orden);

    let promo: any | null = null;
    if (dto.id_promocion) {
      promo = await this.prisma.promociones.findUnique({
        where: { id_promocion: Number(dto.id_promocion) },
      });
    } else if (dto.codigo) {
      promo = await this.prisma.promociones.findFirst({
        where: { codigo_promocion: dto.codigo },
      });
    } else {
      throw new BadRequestException('Debe enviar id_promocion o codigo');
    }
    if (!promo) throw new NotFoundException('Promoción no encontrada');
    if (!promo.activa) throw new BadRequestException('Promoción inactiva');

    if (promo.requiere_codigo && dto.codigo !== promo.codigo_promocion) {
      throw new BadRequestException('Código de promoción inválido');
    }

    const targets = await this.getTargets(promo.id_promocion);
    if (!this.baseAplicable(promo, orden, targets)) {
      throw new BadRequestException('La promoción no aplica a esta orden');
    }

    const descuento = this.calcularDescuento(promo, orden, targets);
    if (descuento <= 0)
      throw new BadRequestException('El descuento calculado es 0');

    const subtotal = Number(orden.subtotal ?? 0);
    const iva = Number(orden.iva_monto ?? 0);
    const ieps = Number(orden.ieps_monto ?? 0);
    const propina = Number(orden.propina ?? 0);
    const total = +(subtotal - descuento + iva + ieps + propina).toFixed(2);

    const updated = await this.prisma.ordenes.update({
      where: { id_orden },
      data: {
        id_promocion_aplicada: promo.id_promocion,
        descuento_porcentaje: 0 as any,
        descuento_monto: descuento as any,
        total: total as any,
      },
    });

    if (promo.maximo_usos_total != null) {
      await this.prisma.promociones.update({
        where: { id_promocion: promo.id_promocion },
        data: { usos_actuales: Number(promo.usos_actuales ?? 0) + 1 },
      });
    }

    return {
      ok: true,
      id_orden,
      id_promocion: promo.id_promocion,
      descuento,
      total,
    };
  }
  async aplicarMejor(id_orden: number) {
    const { aplicables } = await this.promosAplicablesOrden(id_orden);
    if (!aplicables?.length)
      throw new BadRequestException('No hay promociones aplicables');
    const mejor = aplicables[0]; // ya vienen ordenadas por mayor descuento
    return this.aplicarPromocion(id_orden, {
      id_promocion: mejor.id_promocion,
    });
  }

  async quitarPromocion(id_orden: number) {
    const orden = await this.prisma.ordenes.findUnique({ where: { id_orden } });
    if (!orden) throw new NotFoundException('Orden no encontrada');

    const subtotal = Number(orden.subtotal ?? 0);
    const iva = Number(orden.iva_monto ?? 0);
    const ieps = Number(orden.ieps_monto ?? 0);
    const propina = Number(orden.propina ?? 0);
    const total = +(subtotal + iva + ieps + propina).toFixed(2);

    const updated = await this.prisma.ordenes.update({
      where: { id_orden },
      data: {
        id_promocion_aplicada: null,
        descuento_porcentaje: 0 as any,
        descuento_monto: 0 as any,
        total: total as any,
      },
    });

    return { ok: true, id_orden, total: updated.total };
  }
}
