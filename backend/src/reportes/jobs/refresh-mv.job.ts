// backend/src/reportes/jobs/refresh-mv.job.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RefreshMvJob {
  private readonly logger = new Logger(RefreshMvJob.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecutar manualmente el refresh de vistas materializadas
   */
  async executeRefresh() {
    this.logger.log('Iniciando actualización de vistas materializadas');

    try {
      const startTime = Date.now();

      // Refrescar vistas materializadas si existen
      await this.prisma
        .$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS mv_analisis_ventas`;
      await this.prisma
        .$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS mv_productos_vendidos`;
      await this.prisma
        .$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS mv_inventario_rotacion`;

      const duration = Date.now() - startTime;

      this.logger.log(
        `Vistas materializadas actualizadas exitosamente en ${duration}ms`,
      );

      return {
        success: true,
        duration,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(
        'Error actualizando vistas materializadas',
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Tarea programada: ejecutar cada día a las 3 AM
   * Puedes cambiar el cron expression según necesites
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleScheduledRefresh() {
    this.logger.log('Ejecutando refresh programado de vistas materializadas');

    try {
      await this.executeRefresh();
    } catch (error) {
      this.logger.error('Error en refresh programado', error.stack);
    }
  }

  /**
   * Tarea programada alternativa: ejecutar cada 6 horas
   * Descomenta si prefieres esta frecuencia
   */
  // @Cron(CronExpression.EVERY_6_HOURS)
  // async handleFrequentRefresh() {
  //   this.logger.log('Ejecutando refresh frecuente de vistas materializadas');
  //   try {
  //     await this.executeRefresh();
  //   } catch (error) {
  //     this.logger.error('Error en refresh frecuente', error.stack);
  //   }
  // }
}
