/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async ventas(q: any) {
    const where: any = {};
    if (q?.desde || q?.hasta) {
      where.fecha_hora_orden = {};
      if (q.desde) where.fecha_hora_orden.gte = new Date(q.desde);
      if (q.hasta) where.fecha_hora_orden.lte = new Date(q.hasta);
    }
    const ordenes = await this.prisma.ordenes.findMany({
      where,
      include: { orden_detalle: true },
    });

    const totalVentas = ordenes.reduce(
      (acc, o) => acc + Number(o.total ?? 0),
      0,
    );
    const totalItems = ordenes
      .flatMap((o) => o.orden_detalle)
      .reduce((a, d) => a + Number(d.cantidad ?? 0), 0);

    return { totalVentas, totalItems, ordenes: ordenes.length };
  }

  // Productos con stock_actual <= stock_minimo (o <= 0 si no tienen mínimo)
  async bajoStock() {
    const inv = await this.prisma.inventario.findMany({
      include: { productos: true },
    });
    return inv.filter((r) => {
      const actual = Number(r.stock_actual ?? 0);
      const minimo = Number(r.stock_minimo ?? 0);
      return actual <= minimo || actual <= 0;
    });
  }

  async kpis(q: any) {
    const ventas = await this.ventas(q);
    const productos = await this.prisma.productos.count();
    const mesas = await this.prisma.mesas.count();
    return { ventas, productos, mesas };
  }
}
