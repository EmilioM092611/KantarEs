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

  // === MEJORA 9: Validación robusta de traslapes ===

  /**
   * Valida y retorna conflictos de horario para una mesa
   */
  async validarTraslape(
    id_mesa: number,
    fecha_inicio: string,
    fecha_fin: string,
    exceptId?: number,
  ) {
    const inicio = this.toDate(fecha_inicio);
    const fin = this.toDate(fecha_fin);

    if (inicio >= fin) {
      throw new BadRequestException('El rango de fechas es inválido');
    }

    if (!id_mesa) {
      return []; // Sin mesa asignada, no hay conflicto
    }

    // Buscar reservaciones que traslapan
    const conflicts = await this.prisma.reservaciones.findMany({
      where: {
        id_mesa,
        estado: { in: ['pendiente', 'confirmada'] },
        fecha_inicio: { lt: fin },
        fecha_fin: { gt: inicio },
        ...(exceptId ? { id_reservacion: { not: exceptId } } : {}),
      },
      select: {
        id_reservacion: true,
        nombre_cliente: true,
        fecha_inicio: true,
        fecha_fin: true,
        estado: true,
      },
    });

    return conflicts;
  }

  /**
   * Assertion que lanza error si hay traslapes
   */
  private async assertNoTraslape(
    id_mesa: number,
    inicio: Date,
    fin: Date,
    exceptId?: number,
  ) {
    const conflicts = await this.validarTraslape(
      id_mesa,
      inicio.toISOString(),
      fin.toISOString(),
      exceptId,
    );

    if (conflicts.length > 0) {
      throw new BadRequestException({
        message: 'La mesa ya tiene una reservación traslapada en ese horario',
        conflicts,
      });
    }
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

    // Validación automática de traslapes si hay mesa asignada
    if (dto.id_mesa) {
      await this.assertNoTraslape(dto.id_mesa, inicio, fin);
    }

    const reservacion = await this.prisma.reservaciones.create({
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
      include: {
        mesas: true,
      },
    });

    return {
      success: true,
      message: 'Reservación creada exitosamente',
      data: reservacion,
    };
  }

  async findOne(id: number) {
    const reservacion = await this.prisma.reservaciones.findUnique({
      where: { id_reservacion: id },
      include: {
        mesas: true,
      },
    });

    if (!reservacion) {
      throw new NotFoundException('Reservación no encontrada');
    }

    return reservacion;
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

    return this.prisma.reservaciones
      .findMany({
        where,
        orderBy: { fecha_inicio: 'asc' },
        include: { mesas: true },
      })
      .then((reservaciones) => ({
        success: true,
        data: reservaciones,
        count: reservaciones.length,
      }));
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

    const actualizada = await this.prisma.reservaciones.update({
      where: { id_reservacion: id },
      data: { estado: dto.estado, notas: dto.notas ?? existe.notas },
      include: { mesas: true },
    });

    return {
      success: true,
      message: `Reservación marcada como ${dto.estado}`,
      data: actualizada,
    };
  }

  async asignarMesa(id: number, dto: { id_mesa: number }) {
    const r = await this.prisma.reservaciones.findUnique({
      where: { id_reservacion: id },
    });
    if (!r) throw new NotFoundException('Reservación no encontrada');

    // Validar traslapes con la nueva mesa
    await this.assertNoTraslape(dto.id_mesa, r.fecha_inicio, r.fecha_fin, id);

    const actualizada = await this.prisma.reservaciones.update({
      where: { id_reservacion: id },
      data: { id_mesa: dto.id_mesa },
      include: { mesas: true },
    });

    return {
      success: true,
      message: 'Mesa asignada exitosamente',
      data: actualizada,
    };
  }

  /**
   * Devuelve mesas disponibles entre [desde, hasta] considerando:
   * - Reservaciones pendientes/confirmadas que traslapan
   * - Sesiones de mesa abiertas (opcional)
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
      this.prisma.mesas.findMany({
        where: { activa: true },
        orderBy: { numero_mesa: 'asc' },
      }),
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

    const ocupadas = mesas.filter(
      (m) =>
        ocupadasPorReserva.has(m.id_mesa) || ocupadasPorSesion.has(m.id_mesa),
    );

    return {
      success: true,
      data: {
        desde,
        hasta,
        disponibles,
        ocupadas,
        total_mesas: mesas.length,
        total_disponibles: disponibles.length,
        total_ocupadas: ocupadas.length,
      },
    };
  }
}
