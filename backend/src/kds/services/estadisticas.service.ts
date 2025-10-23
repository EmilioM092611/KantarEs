// backend/src/kds/services/estadisticas.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoItemKDS, EstadisticasKDS } from '../interfaces/kds.interface';

@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  async obtenerEstadisticasGenerales(): Promise<EstadisticasKDS> {
    const [
      itemsActivos,
      itemsPendientes,
      itemsPreparando,
      itemsListos,
      ordenesActivas,
    ] = await Promise.all([
      this.prisma.kds_orden_items.count({
        where: {
          estado: {
            in: [
              EstadoItemKDS.PENDIENTE,
              EstadoItemKDS.PREPARANDO,
              EstadoItemKDS.LISTO,
            ],
          },
        },
      }),
      this.prisma.kds_orden_items.count({
        where: { estado: EstadoItemKDS.PENDIENTE },
      }),
      this.prisma.kds_orden_items.count({
        where: { estado: EstadoItemKDS.PREPARANDO },
      }),
      this.prisma.kds_orden_items.count({
        where: { estado: EstadoItemKDS.LISTO },
      }),
      this.prisma.kds_orden_items.groupBy({
        by: ['id_orden_detalle'],
        where: {
          estado: {
            in: [
              EstadoItemKDS.PENDIENTE,
              EstadoItemKDS.PREPARANDO,
              EstadoItemKDS.LISTO,
            ],
          },
        },
      }),
    ]);

    // Calcular tiempo promedio de preparación
    const itemsCompletados = await this.prisma.kds_orden_items.findMany({
      where: {
        fecha_hora_iniciado: { not: null },
        fecha_hora_completado: { not: null },
      },
      select: {
        fecha_hora_iniciado: true,
        fecha_hora_completado: true,
      },
      take: 50, // Últimos 50 items
    });

    let tiempoPromedioPreparacion = 0;
    if (itemsCompletados.length > 0) {
      const tiempos = itemsCompletados.map((item) => {
        const inicio = new Date(item.fecha_hora_iniciado!).getTime();
        const fin = new Date(item.fecha_hora_completado!).getTime();
        return (fin - inicio) / (1000 * 60);
      });
      tiempoPromedioPreparacion =
        tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    }

    // Items con alerta
    const itemsConAlerta = await this.prisma.kds_orden_items.count({
      where: { alerta_tiempo_excedido: true },
    });

    // Estadísticas por estación
    const estaciones = await this.prisma.kds_estaciones.findMany({
      where: { activo: true },
      include: {
        kds_orden_items: {
          where: {
            estado: {
              in: [
                EstadoItemKDS.PENDIENTE,
                EstadoItemKDS.PREPARANDO,
                EstadoItemKDS.LISTO,
              ],
            },
          },
        },
      },
    });

    const porEstacion = {};
    for (const estacion of estaciones) {
      const items = estacion.kds_orden_items;
      porEstacion[estacion.nombre] = {
        activos: items.length,
        pendientes: items.filter((i) => i.estado === EstadoItemKDS.PENDIENTE)
          .length,
        preparando: items.filter((i) => i.estado === EstadoItemKDS.PREPARANDO)
          .length,
        tiempo_promedio: 0, // Calcular si es necesario
      };
    }

    return {
      items_activos: itemsActivos,
      items_pendientes: itemsPendientes,
      items_preparando: itemsPreparando,
      items_listos: itemsListos,
      tiempo_promedio_preparacion: Math.floor(tiempoPromedioPreparacion),
      items_con_alerta: itemsConAlerta,
      ordenes_activas: ordenesActivas.length,
      por_estacion: porEstacion,
    };
  }

  async obtenerEstadisticasPorEstacion(id_estacion: number) {
    const items = await this.prisma.kds_orden_items.findMany({
      where: {
        id_estacion,
        estado: {
          in: [
            EstadoItemKDS.PENDIENTE,
            EstadoItemKDS.PREPARANDO,
            EstadoItemKDS.LISTO,
          ],
        },
      },
    });

    return {
      total_activos: items.length,
      pendientes: items.filter((i) => i.estado === EstadoItemKDS.PENDIENTE)
        .length,
      preparando: items.filter((i) => i.estado === EstadoItemKDS.PREPARANDO)
        .length,
      listos: items.filter((i) => i.estado === EstadoItemKDS.LISTO).length,
    };
  }
}
