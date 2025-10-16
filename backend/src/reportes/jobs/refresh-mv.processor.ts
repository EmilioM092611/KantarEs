// backend/src/reportes/jobs/refresh-mv.processor.ts
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface RefreshMVJobData {
  view_name: string;
  concurrent: boolean;
  requested_by?: string;
  requested_at: Date;
}

@Processor('reportes') // nombre de la cola
export class RefreshMVProcessor extends WorkerHost {
  private readonly logger = new Logger(RefreshMVProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // Punto de entrada único para los jobs de la cola "reportes"
  async process(job: Job<RefreshMVJobData>) {
    if (job.name !== 'refresh-materialized-view') {
      throw new Error(`Job no soportado: ${job.name}`);
    }
    return this.handleRefreshMV(job);
  }

  private async handleRefreshMV(job: Job<RefreshMVJobData>) {
    const { view_name, concurrent } = job.data;
    this.assertValidIdentifier(view_name); // pequeña validación por seguridad

    const startTime = Date.now();
    this.logger.log(
      `Iniciando refresh de ${view_name} (concurrent: ${concurrent})`,
    );

    try {
      // Actualizar progreso
      await job.updateProgress(10);

      // Ejecutar refresh
      const refreshQuery = concurrent
        ? `REFRESH MATERIALIZED VIEW CONCURRENTLY ${view_name}`
        : `REFRESH MATERIALIZED VIEW ${view_name}`;

      await this.prisma.$executeRawUnsafe(refreshQuery);

      await job.updateProgress(90);

      const duration = Date.now() - startTime;
      this.logger.log(`Refresh de ${view_name} completado en ${duration}ms`);

      // Registrar en auditoría (mantengo tu enfoque actual)
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO auditoria_sistema (tabla_afectada, id_registro, accion, id_usuario, valores_nuevos, fecha_hora)
         VALUES ($1, 0, $2, 1, $3, NOW())`,
        view_name,
        'REFRESH_MV',
        JSON.stringify({
          duration_ms: duration,
          concurrent,
          job_id: job.id,
        }),
      );

      await job.updateProgress(100);

      return {
        success: true,
        view_name,
        duration_ms: duration,
        rows_affected: await this.getRowCount(view_name),
      };
    } catch (error: any) {
      this.logger.error(
        `Error al refrescar ${view_name}: ${error.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  private async getRowCount(viewName: string): Promise<number> {
    try {
      const result = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `SELECT COUNT(*) as count FROM ${viewName}`,
      );
      return Number(result[0].count);
    } catch {
      return 0;
    }
  }

  // Evita inyección en identificadores (vistas/tablas)
  private assertValidIdentifier(name: string) {
    if (!/^[A-Za-z0-9_]+$/.test(name)) {
      throw new Error(`Nombre de vista inválido: ${name}`);
    }
  }

  // (Opcional) hooks de eventos del worker
  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Job ${job.id} completado.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.warn(`Job ${job?.id} falló: ${err.message}`);
  }
}
