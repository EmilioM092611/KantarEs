// src/cfdi/reportes/reportes.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ReportePeriodoDto,
  FiltrosReporteDto,
  ReporteResumenDto,
} from './dto/reporte-periodo.dto';

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generar reporte de CFDIs emitidos en un periodo
   */
  async generarReportePeriodo(
    dto: ReportePeriodoDto,
    filtros: FiltrosReporteDto = {},
  ) {
    const { fecha_inicio, fecha_fin, tipo, estado, rfc_receptor } = dto;
    const {
      pagina = 1,
      limite = 50,
      orden_por = 'fecha_timbrado',
      direccion = 'desc',
    } = filtros;

    // Construir WHERE clause
    const where: any = {
      fecha_timbrado: {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin),
      },
    };

    if (tipo && tipo !== 'todos') {
      where.tipo = tipo;
    }

    if (estado && estado !== 'todos') {
      where.estatus = estado;
    }

    if (rfc_receptor) {
      where.cfdi_receptores = {
        rfc: rfc_receptor,
      };
    }

    // Obtener registros paginados
    const skip = (pagina - 1) * limite;
    const [cfdis, total] = await Promise.all([
      this.prisma.cfdi_comprobantes.findMany({
        where,
        include: {
          cfdi_receptores: {
            select: {
              rfc: true,
              razon_social: true,
              email: true,
            },
          },
          ordenes: {
            select: {
              id_orden: true,
              // ✅ CORREGIDO: usar 'folio' en vez de 'numero_orden'
              folio: true,
              total: true,
            },
          },
        },
        orderBy: {
          [orden_por]: direccion,
        },
        skip,
        take: limite,
      }),
      this.prisma.cfdi_comprobantes.count({ where }),
    ]);

    // Calcular resumen
    const resumen = await this.calcularResumen(where);

    return {
      cfdis: cfdis.map((cfdi) => ({
        id_cfdi: cfdi.id_cfdi,
        // ✅ CORREGIDO: uuid existe en el schema, no folio_fiscal
        uuid: cfdi.uuid,
        tipo: cfdi.tipo,
        serie: cfdi.serie,
        folio: cfdi.folio,
        fecha_timbrado: cfdi.fecha_timbrado,
        // ✅ CORREGIDO: fecha_timbrado existe en el schema, no fecha_certificacion
        subtotal: Number(cfdi.subtotal),
        total: Number(cfdi.total),
        estatus: cfdi.estatus,
        // ✅ CORREGIDO: estos campos ya están incluidos en el select
        receptor: cfdi.cfdi_receptores,
        orden: cfdi.ordenes,
      })),
      resumen,
      paginacion: {
        pagina,
        limite,
        total,
        total_paginas: Math.ceil(total / limite),
      },
    };
  }

  /**
   * Calcular resumen estadístico del periodo
   */
  private async calcularResumen(where: any): Promise<ReporteResumenDto> {
    const [stats, cancelados, porTipo] = await Promise.all([
      // Totales generales
      this.prisma.cfdi_comprobantes.aggregate({
        where: {
          ...where,
          estatus: 'timbrado',
        },
        _sum: {
          subtotal: true,
          total: true,
        },
        _count: {
          id_cfdi: true,
        },
      }),

      // Total cancelados
      this.prisma.cfdi_comprobantes.count({
        where: {
          ...where,
          estatus: 'cancelado',
        },
      }),

      // Agrupado por tipo
      this.prisma.cfdi_comprobantes.groupBy({
        by: ['tipo'],
        where: {
          ...where,
          estatus: 'timbrado',
        },
        _count: {
          tipo: true,
        },
      }),
    ]);

    // Calcular impuestos (total - subtotal)
    const subtotal = Number(stats._sum.subtotal || 0);
    const total = Number(stats._sum.total || 0);
    const impuestos = total - subtotal;

    // Contar por tipo
    const tiposCounts = {
      I: 0,
      E: 0,
      P: 0,
    };

    porTipo.forEach((item) => {
      tiposCounts[item.tipo as 'I' | 'E' | 'P'] = item._count.tipo;
    });

    return {
      fecha_inicio: where.fecha_timbrado.gte.toISOString(),
      fecha_fin: where.fecha_timbrado.lte.toISOString(),
      total_cfdis: stats._count.id_cfdi,
      total_cancelados: cancelados,
      monto_total: total,
      subtotal,
      impuestos,
      cfdis_ingreso: tiposCounts.I,
      cfdis_egreso: tiposCounts.E,
      cfdis_pago: tiposCounts.P,
    };
  }

  /**
   * Reporte de cancelaciones en un periodo
   */
  async reporteCancelaciones(dto: ReportePeriodoDto) {
    const { fecha_inicio, fecha_fin } = dto;

    const cancelaciones = await this.prisma.cfdi_comprobantes.findMany({
      where: {
        estatus: 'cancelado',
        fecha_cancelacion: {
          gte: new Date(fecha_inicio),
          lte: new Date(fecha_fin),
        },
      },
      include: {
        cfdi_receptores: {
          select: {
            rfc: true,
            razon_social: true,
          },
        },
      },
      orderBy: {
        fecha_cancelacion: 'desc',
      },
    });

    const resumen = {
      total_cancelaciones: cancelaciones.length,
      monto_cancelado: cancelaciones.reduce(
        (sum, cfdi) => sum + Number(cfdi.total),
        0,
      ),
      fecha_inicio,
      fecha_fin,
    };

    return {
      cancelaciones: cancelaciones.map((cfdi) => ({
        id_cfdi: cfdi.id_cfdi,
        // ✅ CORREGIDO: uuid existe en el schema, no folio_fiscal
        uuid: cfdi.uuid,
        fecha_timbrado: cfdi.fecha_timbrado,
        fecha_cancelacion: cfdi.fecha_cancelacion,
        motivo_cancelacion: cfdi.motivo_cancelacion,
        total: Number(cfdi.total),
        receptor: cfdi.cfdi_receptores,
      })),
      resumen,
    };
  }

  /**
   * Dashboard fiscal con KPIs
   */
  async getDashboardFiscal(anio?: number, mes?: number) {
    const now = new Date();
    const year = anio || now.getFullYear();
    const month = mes || now.getMonth() + 1;

    // Calcular fechas del periodo
    const fechaInicio = new Date(year, month - 1, 1);
    const fechaFin = new Date(year, month, 0, 23, 59, 59);

    // Obtener estadísticas del mes actual
    const statsActual = await this.calcularResumen({
      fecha_timbrado: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    });

    // Obtener estadísticas del mes anterior para comparación
    const fechaInicioAnterior = new Date(year, month - 2, 1);
    const fechaFinAnterior = new Date(year, month - 1, 0, 23, 59, 59);

    const statsAnterior = await this.calcularResumen({
      fecha_timbrado: {
        gte: fechaInicioAnterior,
        lte: fechaFinAnterior,
      },
    });

    // Calcular variaciones porcentuales
    const variacion_cfdis = this.calcularVariacion(
      statsActual.total_cfdis,
      statsAnterior.total_cfdis,
    );

    const variacion_monto = this.calcularVariacion(
      statsActual.monto_total,
      statsAnterior.monto_total,
    );

    // Top 5 receptores del periodo
    const topReceptores = await this.getTopReceptores(fechaInicio, fechaFin);

    // Facturación por día del mes
    const facturacionDiaria = await this.getFacturacionDiaria(
      fechaInicio,
      fechaFin,
    );

    return {
      periodo: {
        mes: month,
        anio: year,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
      },
      kpis: {
        total_cfdis: statsActual.total_cfdis,
        variacion_cfdis,
        monto_total: statsActual.monto_total,
        variacion_monto,
        total_cancelados: statsActual.total_cancelados,
        ticket_promedio:
          statsActual.total_cfdis > 0
            ? statsActual.monto_total / statsActual.total_cfdis
            : 0,
      },
      distribucion: {
        ingreso: statsActual.cfdis_ingreso,
        egreso: statsActual.cfdis_egreso,
        pago: statsActual.cfdis_pago,
      },
      top_receptores: topReceptores,
      facturacion_diaria: facturacionDiaria,
    };
  }

  /**
   * Calcular variación porcentual
   */
  private calcularVariacion(actual: number, anterior: number): number {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior) * 100;
  }

  /**
   * Obtener top receptores por monto facturado
   */
  private async getTopReceptores(fechaInicio: Date, fechaFin: Date) {
    const result = await this.prisma.cfdi_comprobantes.groupBy({
      by: ['id_receptor'],
      where: {
        fecha_timbrado: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estatus: 'timbrado',
      },
      _sum: {
        total: true,
      },
      _count: {
        id_cfdi: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 5,
    });

    // Obtener datos de receptores
    const receptoresData = await Promise.all(
      result.map(async (item) => {
        const receptor = await this.prisma.cfdi_receptores.findUnique({
          where: { id_receptor: item.id_receptor },
          select: {
            rfc: true,
            razon_social: true,
          },
        });
        return {
          ...receptor,
          total_facturado: Number(item._sum.total || 0),
          cantidad_facturas: item._count.id_cfdi,
        };
      }),
    );

    return receptoresData;
  }

  /**
   * Obtener facturación diaria del periodo
   */
  private async getFacturacionDiaria(fechaInicio: Date, fechaFin: Date) {
    // Nota: En PostgreSQL con Prisma es más eficiente hacer esto con raw query
    const result = await this.prisma.$queryRaw<
      Array<{ fecha: Date; total: number; cantidad: number }>
    >`
      SELECT 
        DATE(fecha_timbrado) as fecha,
        SUM(total)::numeric as total,
        COUNT(*)::integer as cantidad
      FROM cfdi_comprobantes
      WHERE fecha_timbrado >= ${fechaInicio}
        AND fecha_timbrado <= ${fechaFin}
        AND estatus = 'timbrado'
      GROUP BY DATE(fecha_timbrado)
      ORDER BY fecha ASC
    `;

    return result.map((item) => ({
      fecha: item.fecha.toISOString().split('T')[0],
      total: Number(item.total),
      cantidad: item.cantidad,
    }));
  }
}
