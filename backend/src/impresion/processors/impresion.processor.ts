/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// backend/src/impresion/processors/impresion.processor.ts

import {
  Processor,
  Process,
  OnQueueFailed,
  OnQueueCompleted,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoTrabajo } from '../interfaces/impresion.interface';

@Processor('impresion')
export class ImpresionProcessor {
  private readonly logger = new Logger(ImpresionProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('imprimir')
  async handleImpresion(job: Job) {
    const { id_trabajo, id_impresora, copias } = job.data;

    this.logger.log(`Procesando trabajo de impresión: ${id_trabajo}`);

    try {
      // Obtener trabajo y configuración de impresora
      const trabajo = await this.prisma.trabajos_impresion.findUnique({
        where: { id_trabajo },
        include: { impresoras: true },
      });

      if (!trabajo) {
        throw new Error('Trabajo no encontrado');
      }

      // Actualizar estado a "imprimiendo"
      await this.prisma.trabajos_impresion.update({
        where: { id_trabajo },
        data: {
          estado: EstadoTrabajo.IMPRIMIENDO,
          fecha_proceso: new Date(),
        },
      });

      // AQUÍ IRÍA LA LÓGICA REAL DE IMPRESIÓN
      // Por ahora simulamos una impresión exitosa
      await this.simularImpresion(trabajo, copias);

      // Actualizar estado a "completado"
      await this.prisma.trabajos_impresion.update({
        where: { id_trabajo },
        data: {
          estado: EstadoTrabajo.COMPLETADO,
          fecha_completado: new Date(),
        },
      });

      this.logger.log(`Trabajo completado: ${id_trabajo}`);

      return {
        success: true,
        id_trabajo,
        mensaje: 'Impresión completada',
      };
    } catch (error: any) {
      this.logger.error(`Error en trabajo ${id_trabajo}: ${error.message}`);

      // Obtener trabajo para incrementar intentos
      const trabajo = await this.prisma.trabajos_impresion.findUnique({
        where: { id_trabajo },
      });

      // Actualizar estado a "error"
      await this.prisma.trabajos_impresion.update({
        where: { id_trabajo },
        data: {
          estado: EstadoTrabajo.ERROR,
          error_mensaje: error.message,
          intentos: (trabajo?.intentos || 0) + 1,
        },
      });

      throw error;
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.debug(`Job ${job.id} completado: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} falló: ${error.message}`);
  }

  // ==================== SIMULACIÓN ====================

  private async simularImpresion(trabajo: any, copias: number): Promise<void> {
    // Simular tiempo de impresión
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.debug(
      `Simulando impresión en ${trabajo.impresoras.nombre} (${copias} copia${copias > 1 ? 's' : ''})`,
    );

    // Simulamos éxito aleatorio (95% éxito)
    if (Math.random() < 0.05) {
      throw new Error('Impresora no responde');
    }
  }
}
