/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservacionesService {
  constructor(private readonly prisma: PrismaService) {}

  private toDate(v: string) {
    return new Date(v);
  }

  private async assertNoTraslape(
    id_mesa: number,
    inicio: Date,
    fin: Date,
    exceptId?: number,
  ) {
    if (!id_mesa) return; // sin mesa asignada aún
    if (inicio >= fin)
      throw new BadRequestException('El rango de fechas es inválido');

    const conflict = await this.prisma.reservaciones.findFirst({
      where: {
        id_mesa,
        estado: { in: ['pendiente', 'confirmada'] },
        fecha_inicio: { lt: fin },
        fecha_fin: { gt: inicio },
        ...(exceptId ? { id_reservacion: { not: exceptId } } : {}),
      },
      select: { id_reservacion: true },
    });

    if (conflict)
      throw new BadRequestException(
        'La mesa ya tiene una reservación traslapada en ese horario',
      );
  }

  async crear(dto: {
    id_mesa?: number;
    nombre_cliente: string;
    telefono?: string;
    personas?: number;
    fecha_inicio: string;
    fecha_fin: string;
    notas?: string;
  }) {
    const inicio = this.toDate(dto.fecha_inicio);
    const fin = this.toDate(dto.fecha_fin);

    if (dto.id_mesa) {
      await this.assertNoTraslape(dto.id_mesa, inicio, fin);
    }

    return this.prisma.reservaciones.create({
      data: {
        id_mesa: dto.id_mesa ?? null,
        nombre_cliente: dto.nombre_cliente,
        telefono: dto.telefono ?? null,
        personas: dto.personas ?? 1,
        fecha_inicio: inicio,
        fecha_fin: fin,
        estado: 'pendiente',
        notas: dto.notas ?? null,
      },
    });
  }

  listar(q: {
    desde?: string;
    hasta?: string;
    estado?: any;
    id_mesa?: number;
  }) {
    const where: any = {};
    if (q.estado) where.estado = q.estado;
    if (q.id_mesa) where.id_mesa = q.id_mesa;
    if (q.desde || q.hasta) {
      where.AND = [];
      if (q.desde) where.AND.push({ fecha_fin: { gte: new Date(q.desde) } });
      if (q.hasta) where.AND.push({ fecha_inicio: { lte: new Date(q.hasta) } });
    }
    return this.prisma.reservaciones.findMany({
      where,
      orderBy: { fecha_inicio: 'asc' },
      include: { mesas: true },
    });
  }

  async cambiarEstado(
    id: number,
    dto: {
      estado: 'confirmada' | 'cancelada' | 'no_show' | 'cumplida';
      notas?: string;
    },
  ) {
    const existe = await this.prisma.reservaciones.findUnique({
      where: { id_reservacion: id },
    });
    if (!existe) throw new NotFoundException('Reservación no encontrada');

    return this.prisma.reservaciones.update({
      where: { id_reservacion: id },
      data: { estado: dto.estado, notas: dto.notas ?? existe.notas },
    });
  }

  async asignarMesa(id: number, dto: { id_mesa: number }) {
    const r = await this.prisma.reservaciones.findUnique({
      where: { id_reservacion: id },
    });
    if (!r) throw new NotFoundException('Reservación no encontrada');

    await this.assertNoTraslape(dto.id_mesa, r.fecha_inicio, r.fecha_fin, id);

    return this.prisma.reservaciones.update({
      where: { id_reservacion: id },
      data: { id_mesa: dto.id_mesa },
    });
  }

  /** Devuelve mesas disponibles entre [desde, hasta] considerando:
   * - Reservaciones pendientes/confirmadas que traslapan.
   * - (Opcional) Mesas con sesión abierta (sesiones_mesa.estado = 'abierta').
   */
  async disponibilidad(q: {
    desde: string;
    hasta: string;
    incluir_abiertas?: 'true' | 'false';
  }) {
    const desde = new Date(q.desde);
    const hasta = new Date(q.hasta);
    if (!(desde < hasta)) throw new BadRequestException('Rango inválido');

    const [mesas, reservas] = await Promise.all([
      this.prisma.mesas.findMany({}), // { id_mesa, nombre, ... }
      this.prisma.reservaciones.findMany({
        where: {
          estado: { in: ['pendiente', 'confirmada'] },
          fecha_inicio: { lt: hasta },
          fecha_fin: { gt: desde },
        },
        select: { id_mesa: true },
      }),
    ]);

    const ocupadasPorReserva = new Set(
      reservas.map((r) => r.id_mesa).filter(Boolean) as number[],
    );

    let ocupadasPorSesion = new Set<number>();
    if (q.incluir_abiertas !== 'false') {
      const sesiones = await this.prisma.sesiones_mesa.findMany({
        where: { estado: 'abierta' },
        select: { id_mesa: true },
      });
      ocupadasPorSesion = new Set(sesiones.map((s) => s.id_mesa));
    }

    const disponibles = mesas.filter(
      (m) =>
        !ocupadasPorReserva.has(m.id_mesa) && !ocupadasPorSesion.has(m.id_mesa),
    );

    return { desde, hasta, disponibles };
  }
}
