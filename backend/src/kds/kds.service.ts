// backend/src/kds/kds.service.ts

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  EstadoItemKDS,
  TicketKDS,
  ItemTicketKDS,
} from './interfaces/kds.interface';
import { CrearEstacionDto, ActualizarEstacionDto } from './dto/estacion.dto';
import {
  CambiarEstadoItemDto,
  CambiarPrioridadDto,
} from './dto/orden-item.dto';
import { TemporizadorService } from './services/temporizador.service';

@Injectable()
export class KdsService {
  private readonly logger = new Logger(KdsService.name);

  constructor(
    private prisma: PrismaService,
    private temporizadorService: TemporizadorService,
  ) {}

  // ==================== GESTIÓN DE ESTACIONES ====================

  async crearEstacion(dto: CrearEstacionDto) {
    const estacion = await this.prisma.kds_estaciones.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        color_hex: dto.color_hex,
        orden_visualizacion: dto.orden_visualizacion,
        muestra_todas_ordenes: dto.muestra_todas_ordenes,
        muestra_solo_asignadas: dto.muestra_solo_asignadas,
        filtro_categorias: dto.filtro_categorias,
        filtro_tipos_producto: dto.filtro_tipos_producto,
        tiempo_alerta_minutos: dto.tiempo_alerta_minutos,
        sonido_alerta: dto.sonido_alerta,
        items_por_pagina: dto.items_por_pagina,
        mostrar_notas: dto.mostrar_notas,
        mostrar_mesero: dto.mostrar_mesero,
        mostrar_tiempo: dto.mostrar_tiempo,
        activo: dto.activo,
      },
    });

    this.logger.log(`Estación KDS creada: ${estacion.nombre}`);
    return estacion;
  }

  async obtenerEstaciones(activo?: boolean) {
    const where = activo !== undefined ? { activo } : {};

    return this.prisma.kds_estaciones.findMany({
      where,
      orderBy: { orden_visualizacion: 'asc' },
    });
  }

  async obtenerEstacionPorId(id_estacion: number) {
    const estacion = await this.prisma.kds_estaciones.findUnique({
      where: { id_estacion },
    });

    if (!estacion) {
      throw new NotFoundException('Estación no encontrada');
    }

    return estacion;
  }

  async actualizarEstacion(id_estacion: number, dto: ActualizarEstacionDto) {
    await this.obtenerEstacionPorId(id_estacion);

    return this.prisma.kds_estaciones.update({
      where: { id_estacion },
      data: dto,
    });
  }

  async eliminarEstacion(id_estacion: number) {
    await this.obtenerEstacionPorId(id_estacion);

    return this.prisma.kds_estaciones.delete({
      where: { id_estacion },
    });
  }

  // ==================== TICKETS Y ITEMS ====================

  async listarTickets(filtros: any = {}): Promise<{
    tickets: TicketKDS[];
    estadisticas: any;
  }> {
    const { estacion, estado, prioridad, mesa, tiempo_espera_min } = filtros;

    // Construir where dinámicamente
    const where: any = {
      estado: {
        in: [
          EstadoItemKDS.PENDIENTE,
          EstadoItemKDS.PREPARANDO,
          EstadoItemKDS.LISTO,
        ],
      },
    };

    if (estacion) {
      where.id_estacion = estacion;
    }

    if (estado) {
      where.estado = estado;
    }

    if (prioridad !== undefined) {
      const prioridadMap = {
        baja: 0,
        normal: 1,
        alta: 2,
        urgente: 3,
      };
      where.prioridad = { gte: prioridadMap[prioridad] || 0 };
    }

    // Obtener items con relaciones
    const items = await this.prisma.kds_orden_items.findMany({
      where,
      include: {
        orden_detalle: {
          include: {
            productos: {
              select: {
                nombre: true,
                imagen_url: true,
              },
            },
            ordenes: {
              include: {
                sesiones_mesa: {
                  include: {
                    mesas: {
                      select: {
                        numero_mesa: true,
                      },
                    },
                  },
                },
                usuarios: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
        },
        kds_estaciones: {
          select: {
            nombre: true,
            color_hex: true,
          },
        },
      },
      orderBy: [{ prioridad: 'desc' }, { fecha_hora_recibido: 'asc' }],
    });

    // Filtrar por mesa si se especifica
    let itemsFiltrados = items;
    if (mesa) {
      itemsFiltrados = items.filter(
        (item) =>
          item.orden_detalle?.ordenes?.sesiones_mesa?.mesas?.numero_mesa ===
          mesa.toString(),
      );
    }

    // Filtrar por tiempo de espera
    if (tiempo_espera_min) {
      itemsFiltrados = itemsFiltrados.filter((item) => {
        const tiempoEspera =
          this.temporizadorService.calcularTiempoTranscurrido(
            item.fecha_hora_recibido || new Date(),
          );
        return tiempoEspera >= tiempo_espera_min;
      });
    }

    // Agrupar por orden
    const ticketsMap = new Map<number, TicketKDS>();

    for (const item of itemsFiltrados) {
      const orden = item.orden_detalle?.ordenes;
      if (!orden) continue;

      const id_orden = orden.id_orden;

      if (!ticketsMap.has(id_orden)) {
        ticketsMap.set(id_orden, {
          id_orden,
          folio: orden.folio,
          mesa: orden.sesiones_mesa?.mesas?.numero_mesa?.toString(),
          mesero: orden.usuarios?.username || 'Desconocido',
          fecha_hora_orden: orden.fecha_hora_orden,
          items: [],
          tiempo_total_espera: 0,
          prioridad_maxima: 0,
          tiene_alertas: false,
          porcentaje_completado: 0,
        });
      }

      const ticket = ticketsMap.get(id_orden)!;

      // Calcular tiempos
      const tiempoEspera = this.temporizadorService.calcularTiempoTranscurrido(
        item.fecha_hora_recibido || new Date(),
      );

      const itemTicket: ItemTicketKDS = {
        id_kds_item: Number(item.id_kds_item),
        id_orden_detalle: item.id_orden_detalle,
        producto: item.orden_detalle?.productos?.nombre || 'Sin nombre',
        cantidad: Number(item.orden_detalle?.cantidad || 0),
        estado: item.estado as EstadoItemKDS,
        notas: item.orden_detalle?.notas_especiales || undefined,
        tiempo_espera_minutos: tiempoEspera,
        tiempo_estimado_minutos: item.tiempo_estimado_minutos || undefined,
        alerta: item.alerta_tiempo_excedido || false,
        prioridad: item.prioridad || 1,
        imagen_url: item.orden_detalle?.productos?.imagen_url || undefined,
      };

      ticket.items.push(itemTicket);
      ticket.tiempo_total_espera = Math.max(
        ticket.tiempo_total_espera,
        tiempoEspera,
      );
      ticket.prioridad_maxima = Math.max(
        ticket.prioridad_maxima,
        item.prioridad || 1,
      );

      if (item.alerta_tiempo_excedido) {
        ticket.tiene_alertas = true;
      }
    }

    // Calcular porcentaje de completado
    const tickets = Array.from(ticketsMap.values()).map((ticket) => {
      const totalItems = ticket.items.length;
      const itemsListos = ticket.items.filter(
        (i) =>
          i.estado === EstadoItemKDS.LISTO ||
          i.estado === EstadoItemKDS.SERVIDO,
      ).length;
      ticket.porcentaje_completado =
        totalItems > 0 ? Math.floor((itemsListos / totalItems) * 100) : 0;
      return ticket;
    });

    // Estadísticas
    const estadisticas = {
      total_tickets: tickets.length,
      total_items: itemsFiltrados.length,
      items_con_alerta: itemsFiltrados.filter((i) => i.alerta_tiempo_excedido)
        .length,
      tiempo_promedio_espera:
        tickets.length > 0
          ? Math.floor(
              tickets.reduce((sum, t) => sum + t.tiempo_total_espera, 0) /
                tickets.length,
            )
          : 0,
    };

    return {
      tickets,
      estadisticas,
    };
  }

  async obtenerItemPorId(id_kds_item: number) {
    const item = await this.prisma.kds_orden_items.findUnique({
      where: { id_kds_item },
      include: {
        orden_detalle: {
          include: {
            productos: true,
            ordenes: {
              include: {
                sesiones_mesa: {
                  include: {
                    mesas: true,
                  },
                },
              },
            },
          },
        },
        kds_estaciones: true,
        usuarios: {
          select: {
            id_usuario: true,
            username: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }

    return item;
  }

  async cambiarEstadoItem(id_kds_item: number, dto: CambiarEstadoItemDto) {
    const item = await this.obtenerItemPorId(id_kds_item);

    // Validar transición de estado
    this.validarTransicionEstado(item.estado || 'pendiente', dto.estado);

    const data: any = {
      estado: dto.estado,
    };

    // Si cambia a preparando, registrar inicio
    if (dto.estado === EstadoItemKDS.PREPARANDO && !item.fecha_hora_iniciado) {
      data.fecha_hora_iniciado = new Date();
      data.id_usuario_prepara = dto.id_usuario_prepara;
    }

    // Si cambia a listo, registrar completado
    if (dto.estado === EstadoItemKDS.LISTO && !item.fecha_hora_completado) {
      data.fecha_hora_completado = new Date();
    }

    const itemActualizado = await this.prisma.kds_orden_items.update({
      where: { id_kds_item },
      data,
      include: {
        orden_detalle: {
          include: {
            productos: true,
            ordenes: {
              include: {
                sesiones_mesa: {
                  include: { mesas: true },
                },
              },
            },
          },
        },
      },
    });

    this.logger.log(
      `Item ${id_kds_item} cambió de ${item.estado} a ${dto.estado}`,
    );

    return itemActualizado;
  }

  async cambiarPrioridad(id_kds_item: number, dto: CambiarPrioridadDto) {
    await this.obtenerItemPorId(id_kds_item);

    return this.prisma.kds_orden_items.update({
      where: { id_kds_item },
      data: { prioridad: dto.prioridad },
    });
  }

  async marcarRequiereAtencion(id_kds_item: number, requiere: boolean) {
    await this.obtenerItemPorId(id_kds_item);

    return this.prisma.kds_orden_items.update({
      where: { id_kds_item },
      data: { requiere_atencion: requiere },
    });
  }

  async marcarTicketListo(id_orden: number) {
    // Obtener todos los items de la orden
    const items = await this.prisma.kds_orden_items.findMany({
      where: {
        orden_detalle: {
          id_orden,
        },
        estado: {
          in: [EstadoItemKDS.PENDIENTE, EstadoItemKDS.PREPARANDO],
        },
      },
    });

    if (items.length === 0) {
      throw new BadRequestException(
        'No hay items pendientes o en preparación para esta orden',
      );
    }

    // Marcar todos como listos
    const resultado = await this.prisma.kds_orden_items.updateMany({
      where: {
        id_kds_item: {
          in: items.map((i) => i.id_kds_item),
        },
      },
      data: {
        estado: EstadoItemKDS.LISTO,
        fecha_hora_completado: new Date(),
      },
    });

    this.logger.log(
      `Orden ${id_orden}: ${resultado.count} items marcados como listos`,
    );

    return {
      items_actualizados: resultado.count,
      mensaje: 'Todos los items marcados como listos',
    };
  }

  async obtenerItemsConAlerta(id_estacion?: number) {
    const where: any = {
      alerta_tiempo_excedido: true,
      estado: {
        in: [EstadoItemKDS.PENDIENTE, EstadoItemKDS.PREPARANDO],
      },
    };

    if (id_estacion) {
      where.id_estacion = id_estacion;
    }

    return this.prisma.kds_orden_items.findMany({
      where,
      include: {
        orden_detalle: {
          include: {
            productos: true,
            ordenes: {
              include: {
                sesiones_mesa: {
                  include: { mesas: true },
                },
              },
            },
          },
        },
      },
      orderBy: { fecha_hora_recibido: 'asc' },
    });
  }

  // ==================== VALIDACIONES ====================

  private validarTransicionEstado(
    estadoActual: string,
    estadoNuevo: EstadoItemKDS,
  ) {
    const transicionesValidas = {
      [EstadoItemKDS.PENDIENTE]: [
        EstadoItemKDS.PREPARANDO,
        EstadoItemKDS.CANCELADO,
      ],
      [EstadoItemKDS.PREPARANDO]: [
        EstadoItemKDS.LISTO,
        EstadoItemKDS.CANCELADO,
      ],
      [EstadoItemKDS.LISTO]: [EstadoItemKDS.SERVIDO],
      [EstadoItemKDS.SERVIDO]: [],
      [EstadoItemKDS.CANCELADO]: [],
    };

    const estadosPermitidos = transicionesValidas[estadoActual] || [];

    if (!estadosPermitidos.includes(estadoNuevo)) {
      throw new BadRequestException(
        `No se puede cambiar de "${estadoActual}" a "${estadoNuevo}"`,
      );
    }
  }

  // ==================== TRIGGER AUTOMÁTICO ====================

  /**
   * Crear items KDS automáticamente cuando se crea un orden_detalle
   * Este método sería llamado desde el módulo de órdenes
   */
  async crearItemsKDSDesdeOrden(id_orden: number) {
    // Obtener todos los detalles de la orden
    const detalles = await this.prisma.orden_detalle.findMany({
      where: { id_orden },
      include: {
        productos: {
          include: {
            categorias: true,
          },
        },
      },
    });

    // Obtener todas las estaciones activas
    const estaciones = await this.prisma.kds_estaciones.findMany({
      where: { activo: true },
    });

    for (const detalle of detalles) {
      // Determinar a qué estación(es) asignar este producto
      for (const estacion of estaciones) {
        let debeAsignar = false;

        // Si la estación muestra todas las órdenes
        if (estacion.muestra_todas_ordenes) {
          debeAsignar = true;
        }
        // Si tiene filtro por categoría
        else if (
          estacion.filtro_categorias &&
          estacion.filtro_categorias.length > 0
        ) {
          if (
            estacion.filtro_categorias.includes(detalle.productos.id_categoria)
          ) {
            debeAsignar = true;
          }
        }
        // Si no tiene filtros, asignar por defecto
        else if (!estacion.filtro_categorias?.length) {
          debeAsignar = true;
        }

        if (debeAsignar) {
          await this.prisma.kds_orden_items.create({
            data: {
              id_orden_detalle: detalle.id_detalle,
              id_estacion: estacion.id_estacion,
              estado: EstadoItemKDS.PENDIENTE,
              prioridad: 1,
              tiempo_estimado_minutos:
                detalle.productos.tiempo_preparacion_min || 10,
            },
          });
        }
      }
    }

    this.logger.log(`Items KDS creados para orden ${id_orden}`);
  }
}
