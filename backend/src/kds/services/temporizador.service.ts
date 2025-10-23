/* eslint-disable @typescript-eslint/no-unsafe-argument */
// backend/src/kds/services/temporizador.service.ts
// REEMPLAZAR TODO EL ARCHIVO:

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoItemKDS } from '../interfaces/kds.interface';

@Injectable()
export class TemporizadorService {
  private readonly logger = new Logger(TemporizadorService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cron que se ejecuta cada minuto para verificar items con tiempo excedido
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async verificarTiemposExcedidos() {
    try {
      // Obtener items activos que no tienen alerta
      const items = await this.prisma.kds_orden_items.findMany({
        where: {
          estado: {
            in: [EstadoItemKDS.PENDIENTE, EstadoItemKDS.PREPARANDO],
          },
          alerta_tiempo_excedido: false,
          tiempo_estimado_minutos: {
            not: null,
          },
        },
        include: {
          kds_estaciones: {
            select: {
              tiempo_alerta_minutos: true,
            },
          },
        },
      });

      let itemsActualizados = 0;

      for (const item of items) {
        // Validar que fecha_hora_recibido no sea null
        if (!item.fecha_hora_recibido) continue;

        const tiempoTranscurrido = this.calcularTiempoTranscurrido(
          item.fecha_hora_recibido,
        );

        const tiempoLimite =
          (item.tiempo_estimado_minutos || 0) +
          (item.kds_estaciones?.tiempo_alerta_minutos || 5);

        if (tiempoTranscurrido >= tiempoLimite) {
          await this.prisma.kds_orden_items.update({
            where: { id_kds_item: item.id_kds_item },
            data: { alerta_tiempo_excedido: true },
          });
          itemsActualizados++;
        }
      }

      if (itemsActualizados > 0) {
        this.logger.warn(
          `${itemsActualizados} items marcados con tiempo excedido`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error al verificar tiempos excedidos: ${error.message}`,
      );
    }
  }

  /**
   * Calcula el tiempo transcurrido en minutos
   */
  calcularTiempoTranscurrido(fechaInicio: Date): number {
    const ahora = new Date();
    const diferencia = ahora.getTime() - new Date(fechaInicio).getTime();
    return Math.floor(diferencia / (1000 * 60));
  }

  /**
   * Obtiene el tiempo restante estimado
   */
  calcularTiempoRestante(fechaInicio: Date, tiempoEstimado: number): number {
    const transcurrido = this.calcularTiempoTranscurrido(fechaInicio);
    const restante = tiempoEstimado - transcurrido;
    return restante > 0 ? restante : 0;
  }

  /**
   * Obtiene tiempos de un item
   */
  async obtenerTiemposItem(id_kds_item: number) {
    const item = await this.prisma.kds_orden_items.findUnique({
      where: { id_kds_item },
    });

    if (!item || !item.fecha_hora_recibido) {
      return null;
    }

    const tiempoEspera = this.calcularTiempoTranscurrido(
      item.fecha_hora_recibido,
    );

    let tiempoPreparacion = 0;
    if (item.fecha_hora_iniciado) {
      const fechaFin = item.fecha_hora_completado || new Date();
      tiempoPreparacion =
        (fechaFin.getTime() - item.fecha_hora_iniciado.getTime()) / (1000 * 60);
    }

    const tiempoRestante = item.tiempo_estimado_minutos
      ? this.calcularTiempoRestante(
          item.fecha_hora_recibido,
          item.tiempo_estimado_minutos,
        )
      : null;

    return {
      tiempo_espera_minutos: Math.floor(tiempoEspera),
      tiempo_preparacion_minutos: Math.floor(tiempoPreparacion),
      tiempo_restante_minutos: tiempoRestante,
      alerta_tiempo_excedido: item.alerta_tiempo_excedido || false,
    };
  }
}
