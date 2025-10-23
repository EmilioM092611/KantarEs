/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificacionesService } from './notificaciones.service';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Servicio Mejorado de Reservaciones
 * Implementa gestión avanzada, recordatorios y lista de espera
 */
@Injectable()
export class ReservacionesService {
  private readonly logger = new Logger(ReservacionesService.name);

  constructor(
    private prisma: PrismaService,
    private notificaciones: NotificacionesService,
  ) {}

  // =====================================================
  // 7.1 GESTIÓN AVANZADA
  // =====================================================

  /**
   * Consultar disponibilidad de mesas
   * GET /reservaciones/disponibilidad
   */
  async consultarDisponibilidad(query: {
    fecha: string;
    hora: string;
    personas: number;
    duracion?: number;
  }) {
    const duracionMinutos = query.duracion || 120;

    // Construir fecha_inicio y fecha_fin
    const [year, month, day] = query.fecha.split('-');
    const [hours, minutes] = query.hora.split(':');

    const fechaInicio = new Date(
      Date.UTC(+year, +month - 1, +day, +hours, +minutes),
    );
    const fechaFin = new Date(
      fechaInicio.getTime() + duracionMinutos * 60 * 1000,
    );

    // Buscar mesas con capacidad adecuada
    const mesasDisponibles = await this.prisma.mesas.findMany({
      where: {
        activa: true,
        capacidad_personas: {
          gte: query.personas, // La mesa debe tener capacidad para las personas solicitadas
        },
      },
      select: {
        id_mesa: true,
        numero_mesa: true,
        capacidad_personas: true,
        ubicacion: true,
      },
    });

    // Verificar cuáles tienen conflictos
    type MesaConDisponibilidad = {
      id_mesa: number;
      numero_mesa: string;
      capacidad_personas: number;
      ubicacion: string | null;
      disponible: boolean;
      conflictos?: Array<{
        id_reservacion: number;
        nombre_cliente: string;
        fecha_inicio: Date;
        fecha_fin: Date;
      }>;
    };

    const mesasConDisponibilidad: MesaConDisponibilidad[] = [];

    for (const mesa of mesasDisponibles) {
      const conflictos = await this.verificarConflictos(
        mesa.id_mesa,
        fechaInicio,
        fechaFin,
      );

      if (conflictos.length === 0) {
        mesasConDisponibilidad.push({
          ...mesa,
          disponible: true,
        });
      } else {
        mesasConDisponibilidad.push({
          ...mesa,
          disponible: false,
          conflictos: conflictos,
        });
      }
    }

    return {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      personas: query.personas,
      mesas_totales: mesasDisponibles.length,
      mesas_disponibles: mesasConDisponibilidad.filter((m) => m.disponible)
        .length,
      mesas: mesasConDisponibilidad,
    };
  }

  /**
   * Bloquear mesa (mantenimiento, eventos, etc.)
   * POST /reservaciones/bloquearmesa
   */
  async bloquearMesa(data: {
    id_mesa: number;
    fecha_inicio: string;
    fecha_fin: string;
    motivo: string;
  }) {
    const fechaInicio = new Date(data.fecha_inicio);
    const fechaFin = new Date(data.fecha_fin);

    if (fechaFin <= fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Verificar si hay conflictos
    const conflictos = await this.verificarConflictos(
      data.id_mesa,
      fechaInicio,
      fechaFin,
    );

    if (conflictos.length > 0) {
      throw new BadRequestException('Ya existe una reservación en ese horario');
    }

    // Crear "reservación" de bloqueo
    return this.prisma.reservaciones.create({
      data: {
        id_mesa: data.id_mesa,
        nombre_cliente: 'BLOQUEO: ' + data.motivo,
        telefono: 'N/A',
        personas: 0,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado: 'confirmada',
        notas: `Bloqueo de mesa: ${data.motivo}`,
      },
    });
  }

  /**
   * Obtener calendario mensual de reservaciones
   * GET /reservaciones/calendario
   */
  async obtenerCalendario(mes: number, anio: number) {
    const fechaInicio = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0));
    const fechaFin = new Date(Date.UTC(anio, mes, 0, 23, 59, 59));

    const reservaciones = await this.prisma.reservaciones.findMany({
      where: {
        fecha_inicio: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: {
          in: ['pendiente', 'confirmada'],
        },
      },
      include: {
        mesas: {
          select: {
            numero_mesa: true,
            capacidad_personas: true,
          },
        },
      },
      orderBy: {
        fecha_inicio: 'asc',
      },
    });

    // Agrupar por día
    const calendario: Record<number, any[]> = {};

    reservaciones.forEach((reserva) => {
      const dia = new Date(reserva.fecha_inicio).getUTCDate();
      if (!calendario[dia]) {
        calendario[dia] = [];
      }
      calendario[dia].push({
        id_reservacion: reserva.id_reservacion,
        nombre_cliente: reserva.nombre_cliente,
        hora: new Date(reserva.fecha_inicio).toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        personas: reserva.personas,
        mesa: reserva.mesas?.numero_mesa,
        estado: reserva.estado,
      });
    });

    return {
      mes,
      anio,
      total_reservaciones: reservaciones.length,
      calendario,
    };
  }

  /**
   * Confirmar reservación por parte del cliente
   * POST /reservaciones/confirmar/:id
   */
  async confirmarReservacion(
    id: number,
    data?: {
      email?: string;
      metodo_contacto_preferido?: string;
    },
  ) {
    const reservacion = await this.prisma.reservaciones.findUnique({
      where: { id_reservacion: id },
      include: {
        mesas: true,
      },
    });

    if (!reservacion) {
      throw new NotFoundException('Reservación no encontrada');
    }

    if (reservacion.estado !== 'pendiente') {
      throw new BadRequestException('La reservación ya ha sido confirmada');
    }

    // Actualizar reservación
    const updated = await this.prisma.reservaciones.update({
      where: { id_reservacion: id },
      data: {
        estado: 'confirmada',
        confirmada_por_cliente: true,
        fecha_confirmacion: new Date(),
        email: data?.email || reservacion.email,
        metodo_contacto_preferido:
          data?.metodo_contacto_preferido ||
          reservacion.metodo_contacto_preferido,
      },
    });

    // Enviar confirmación (solo si tenemos teléfono)
    if (updated.telefono) {
      await this.notificaciones.enviarConfirmacion({
        nombre: updated.nombre_cliente,
        telefono: updated.telefono,
        email: updated.email || undefined,
        fecha_reservacion: updated.fecha_inicio,
        numero_mesa: reservacion.mesas?.numero_mesa,
        personas: updated.personas || 1,
        folio: `RES-${updated.id_reservacion.toString().padStart(6, '0')}`,
      });
    }

    return updated;
  }

  /**
   * Enviar recordatorio manual
   * POST /reservaciones/recordatorio/:id
   */
  async enviarRecordatorio(id: number) {
    const reservacion = await this.prisma.reservaciones.findUnique({
      where: { id_reservacion: id },
      include: {
        mesas: true,
      },
    });

    if (!reservacion) {
      throw new NotFoundException('Reservación no encontrada');
    }

    if (!reservacion.telefono) {
      throw new BadRequestException(
        'La reservación no tiene teléfono registrado',
      );
    }

    const metodo = (reservacion.metodo_contacto_preferido || 'whatsapp') as any;

    const enviado = await this.notificaciones.enviarRecordatorioReservacion({
      nombre: reservacion.nombre_cliente,
      telefono: reservacion.telefono,
      email: reservacion.email || undefined,
      fecha_reservacion: reservacion.fecha_inicio,
      numero_mesa: reservacion.mesas?.numero_mesa,
      personas: reservacion.personas || 1,
      metodo: metodo,
    });

    if (enviado) {
      await this.prisma.reservaciones.update({
        where: { id_reservacion: id },
        data: {
          recordatorio_enviado: true,
          fecha_envio_recordatorio: new Date(),
        },
      });
    }

    return {
      enviado,
      metodo,
      mensaje: enviado
        ? 'Recordatorio enviado exitosamente'
        : 'Error al enviar recordatorio',
    };
  }

  /**
   * Historial de reservaciones de un cliente
   * GET /reservaciones/historial-cliente
   */
  async obtenerHistorialCliente(telefono: string, limite: number = 20) {
    const reservaciones = await this.prisma.reservaciones.findMany({
      where: {
        telefono: telefono,
      },
      include: {
        mesas: {
          select: {
            numero_mesa: true,
            capacidad_personas: true,
          },
        },
      },
      orderBy: {
        fecha_inicio: 'desc',
      },
      take: limite,
    });

    // Calcular estadísticas
    const total = reservaciones.length;
    const completadas = reservaciones.filter(
      (r) => r.estado === 'cumplida',
    ).length;
    const canceladas = reservaciones.filter(
      (r) => r.estado === 'cancelada',
    ).length;
    const noShow = reservaciones.filter((r) => r.estado === 'no_show').length;

    return {
      telefono,
      total_reservaciones: total,
      reservaciones_completadas: completadas,
      reservaciones_canceladas: canceladas,
      no_show: noShow,
      tasa_cumplimiento: total > 0 ? (completadas / total) * 100 : 0,
      reservaciones: reservaciones.map((r) => ({
        id_reservacion: r.id_reservacion,
        fecha: r.fecha_inicio,
        personas: r.personas,
        mesa: r.mesas?.numero_mesa,
        estado: r.estado,
        notas: r.notas,
      })),
    };
  }

  // =====================================================
  // 7.2 RECORDATORIOS AUTOMÁTICOS
  // =====================================================

  /**
   * Cron job: Enviar recordatorios 24h antes
   * Se ejecuta cada hora
   */
  @Cron(CronExpression.EVERY_HOUR)
  async enviarRecordatoriosAutomaticos() {
    this.logger.log('Ejecutando envío de recordatorios automáticos...');

    // Buscar reservaciones para mañana que no tengan recordatorio enviado
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);

    const pasadoManana = new Date(manana);
    pasadoManana.setDate(pasadoManana.getDate() + 1);

    const reservaciones = await this.prisma.reservaciones.findMany({
      where: {
        fecha_inicio: {
          gte: manana,
          lt: pasadoManana,
        },
        estado: {
          in: ['pendiente', 'confirmada'],
        },
        recordatorio_enviado: false,
        telefono: {
          not: null, // Solo reservaciones con teléfono
        },
      },
      include: {
        mesas: true,
      },
    });

    this.logger.log(
      `Encontradas ${reservaciones.length} reservaciones para recordar`,
    );

    for (const reserva of reservaciones) {
      try {
        // Verificar que tenga teléfono antes de intentar enviar
        if (!reserva.telefono) continue;

        const metodo = (reserva.metodo_contacto_preferido || 'whatsapp') as any;

        await this.notificaciones.enviarRecordatorioReservacion({
          nombre: reserva.nombre_cliente,
          telefono: reserva.telefono,
          email: reserva.email || undefined,
          fecha_reservacion: reserva.fecha_inicio,
          numero_mesa: reserva.mesas?.numero_mesa,
          personas: reserva.personas || 1,
          metodo: metodo,
        });

        await this.prisma.reservaciones.update({
          where: { id_reservacion: reserva.id_reservacion },
          data: {
            recordatorio_enviado: true,
            fecha_envio_recordatorio: new Date(),
          },
        });

        this.logger.log(
          `Recordatorio enviado: ${reserva.nombre_cliente} (${metodo})`,
        );
      } catch (error) {
        this.logger.error(
          `Error enviando recordatorio a ${reserva.nombre_cliente}: ${error.message}`,
        );
      }
    }
  }

  // =====================================================
  // 7.3 LISTA DE ESPERA
  // =====================================================

  /**
   * Agregar cliente a lista de espera
   * POST /reservaciones/lista-espera
   */
  async agregarListaEspera(data: {
    nombre: string;
    telefono: string;
    personas: number;
    tiempo_espera_estimado?: number;
    notas?: string;
  }) {
    return this.prisma.lista_espera.create({
      data: {
        nombre: data.nombre,
        telefono: data.telefono,
        personas: data.personas,
        tiempo_espera_estimado: data.tiempo_espera_estimado,
        notas: data.notas,
        hora_llegada: new Date(),
        estado: 'activa',
        notificado: false,
      },
    });
  }

  /**
   * Obtener lista de espera activa
   * GET /reservaciones/lista-espera/activa
   */
  async obtenerListaEsperaActiva() {
    const lista = await this.prisma.lista_espera.findMany({
      where: {
        estado: {
          in: ['activa', 'notificada'],
        },
      },
      orderBy: {
        hora_llegada: 'asc',
      },
    });

    // Calcular tiempo esperado real y posición
    const ahora = new Date();

    return lista.map((item, index) => {
      const tiempoEsperadoReal = Math.floor(
        (ahora.getTime() - new Date(item.hora_llegada).getTime()) / 60000,
      );

      return {
        ...item,
        tiempo_esperado_real: tiempoEsperadoReal,
        posicion_en_lista: index + 1,
      };
    });
  }

  /**
   * Notificar cliente en lista de espera
   * PATCH /reservaciones/lista-espera/:id/notificar
   */
  async notificarListaEspera(
    id: number,
    data?: {
      metodo?: string;
      mensaje?: string;
    },
  ) {
    const item = await this.prisma.lista_espera.findUnique({
      where: { id_lista_espera: id },
    });

    if (!item) {
      throw new NotFoundException('Entrada no encontrada en lista de espera');
    }

    if (item.estado !== 'activa') {
      throw new BadRequestException('La entrada ya no está activa');
    }

    const metodo = (data?.metodo || 'whatsapp') as any;
    const tiempoEspera = Math.floor(
      (new Date().getTime() - new Date(item.hora_llegada).getTime()) / 60000,
    );

    const enviado = await this.notificaciones.notificarListaEspera({
      nombre: item.nombre,
      telefono: item.telefono,
      personas: item.personas,
      tiempo_espera: tiempoEspera,
      metodo: metodo,
      mensaje: data?.mensaje,
    });

    if (enviado) {
      await this.prisma.lista_espera.update({
        where: { id_lista_espera: id },
        data: {
          notificado: true,
          estado: 'notificada',
        },
      });
    }

    return {
      enviado,
      metodo,
      mensaje: enviado
        ? 'Cliente notificado exitosamente'
        : 'Error al notificar cliente',
    };
  }

  /**
   * Eliminar de lista de espera
   * DELETE /reservaciones/lista-espera/:id
   */
  async eliminarDeListaEspera(id: number) {
    const item = await this.prisma.lista_espera.findUnique({
      where: { id_lista_espera: id },
    });

    if (!item) {
      throw new NotFoundException('Entrada no encontrada');
    }

    await this.prisma.lista_espera.update({
      where: { id_lista_espera: id },
      data: {
        estado: 'cancelada',
      },
    });

    return {
      mensaje: 'Cliente eliminado de lista de espera',
    };
  }

  /**
   * Marcar como atendido en lista de espera
   */
  async marcarComoAtendido(id: number) {
    return this.prisma.lista_espera.update({
      where: { id_lista_espera: id },
      data: {
        estado: 'atendida',
      },
    });
  }

  // =====================================================
  // MÉTODOS AUXILIARES
  // =====================================================

  /**
   * Verificar conflictos de horario en una mesa
   */
  private async verificarConflictos(
    idMesa: number,
    fechaInicio: Date,
    fechaFin: Date,
    excluirId?: number,
  ) {
    const whereClause: any = {
      id_mesa: idMesa,
      estado: {
        in: ['pendiente', 'confirmada'],
      },
      OR: [
        {
          AND: [
            { fecha_inicio: { lte: fechaInicio } },
            { fecha_fin: { gt: fechaInicio } },
          ],
        },
        {
          AND: [
            { fecha_inicio: { lt: fechaFin } },
            { fecha_fin: { gte: fechaFin } },
          ],
        },
        {
          AND: [
            { fecha_inicio: { gte: fechaInicio } },
            { fecha_fin: { lte: fechaFin } },
          ],
        },
      ],
    };

    if (excluirId) {
      whereClause.id_reservacion = {
        not: excluirId,
      };
    }

    return this.prisma.reservaciones.findMany({
      where: whereClause,
      select: {
        id_reservacion: true,
        nombre_cliente: true,
        fecha_inicio: true,
        fecha_fin: true,
      },
    });
  }
}
