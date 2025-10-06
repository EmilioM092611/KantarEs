/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KdsService {
  constructor(private readonly prisma: PrismaService) {}

  async listarTickets(q: any) {
    const whereOD: any = {};
    if (q?.estado) whereOD.estado = q.estado;

    const whereOrden: any = {};
    if (q?.desde || q?.hasta) {
      whereOrden.fecha_hora_orden = {};
      if (q.desde) whereOrden.fecha_hora_orden.gte = new Date(q.desde);
      if (q.hasta) whereOrden.fecha_hora_orden.lte = new Date(q.hasta);
    }

    const tickets = await this.prisma.ordenes.findMany({
      where: whereOrden,
      orderBy: { fecha_hora_orden: 'asc' },
      include: {
        orden_detalle: { where: whereOD, include: { productos: true } },
        sesiones_mesa: { include: { mesas: true } }, // <- así accedemos a la mesa
        usuarios: true, // mesero
      },
    });

    return tickets.map((t) => ({
      id_orden: t.id_orden,
      mesa: t.sesiones_mesa?.mesas?.numero_mesa ?? t.sesiones_mesa?.id_mesa,
      mesero: t.usuarios?.username,
      hora: t.fecha_hora_orden,
      items: t.orden_detalle.map((d) => ({
        id_detalle: d.id_detalle,
        producto: d.productos?.nombre,
        cantidad: d.cantidad,
        estado: d.estado,
      })),
    }));
  }

  actualizarEstadoItem(idDetalle: number, dto: any) {
    return this.prisma.orden_detalle.update({
      where: { id_detalle: idDetalle },
      data: { estado: dto?.estado ?? 'en_preparacion' },
    });
  }

  async marcarTicketListo(idOrden: number) {
    const existe = await this.prisma.ordenes.findUnique({
      where: { id_orden: idOrden },
    });
    if (!existe) throw new NotFoundException('Orden no encontrada');

    await this.prisma.orden_detalle.updateMany({
      where: { id_orden: idOrden },
      data: { estado: 'listo' },
    });
    return { ok: true, id_orden: idOrden };
  }
}
