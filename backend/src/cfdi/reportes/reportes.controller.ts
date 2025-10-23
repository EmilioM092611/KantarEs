// src/cfdi/reportes/reportes.controller.ts

import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ReportesService } from './reportes.service';
import { ExcelGeneratorService } from './excel/excel-generator.service';
import { ReportePeriodoDto, FiltrosReporteDto } from './dto/reporte-periodo.dto';

@ApiTags('CFDI - Reportes')
@Controller('cfdi/reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportesController {
  constructor(
    private readonly reportesService: ReportesService,
    private readonly excelService: ExcelGeneratorService,
  ) {}

  @Get('periodo')
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reporte de CFDIs por periodo',
    description: `
      Genera un reporte detallado de todos los CFDIs emitidos en un periodo específico.
      
      **Filtros disponibles:**
      - Por fechas (obligatorio)
      - Por tipo de CFDI (I/P/E)
      - Por estado (timbrado/cancelado)
      - Por RFC del receptor
      
      **Incluye:**
      - Lista de CFDIs con detalles
      - Resumen estadístico (totales, impuestos, etc.)
      - Paginación de resultados
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte generado exitosamente',
  })
  async reportePeriodo(
    @Query() dto: ReportePeriodoDto,
    @Query() filtros: FiltrosReporteDto,
  ) {
    return this.reportesService.generarReportePeriodo(dto, filtros);
  }

  @Get('cancelaciones')
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reporte de CFDIs cancelados',
    description: `
      Lista todos los CFDIs que fueron cancelados en un periodo.
      
      **Incluye:**
      - UUID del CFDI cancelado
      - Fecha de cancelación
      - Motivo de cancelación
      - Monto del CFDI
      - Datos del receptor
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de cancelaciones generado',
  })
  async reporteCancelaciones(@Query() dto: ReportePeriodoDto) {
    return this.reportesService.reporteCancelaciones(dto);
  }

  @Get('dashboard')
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dashboard fiscal con KPIs',
    description: `
      Dashboard ejecutivo con indicadores clave de facturación.
      
      **KPIs incluidos:**
      - Total de CFDIs emitidos
      - Monto total facturado
      - Variación vs mes anterior
      - Ticket promedio
      - Top 5 clientes
      - Gráfica de facturación diaria
      - Distribución por tipo de CFDI
    `,
  })
  @ApiQuery({
    name: 'anio',
    required: false,
    description: 'Año del reporte (default: año actual)',
    example: 2025,
  })
  @ApiQuery({
    name: 'mes',
    required: false,
    description: 'Mes del reporte (1-12, default: mes actual)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard generado exitosamente',
    schema: {
      example: {
        periodo: {
          mes: 10,
          anio: 2025,
          fecha_inicio: '2025-10-01T00:00:00.000Z',
          fecha_fin: '2025-10-31T23:59:59.999Z',
        },
        kpis: {
          total_cfdis: 245,
          variacion_cfdis: 12.5,
          monto_total: 458900.5,
          variacion_monto: 8.3,
          total_cancelados: 3,
          ticket_promedio: 1873.06,
        },
        distribucion: {
          ingreso: 240,
          egreso: 3,
          pago: 2,
        },
        top_receptores: [
          {
            rfc: 'XAXX010101000',
            razon_social: 'Juan Pérez García',
            total_facturado: 45600.0,
            cantidad_facturas: 28,
          },
        ],
        facturacion_diaria: [
          {
            fecha: '2025-10-01',
            total: 15600.0,
            cantidad: 8,
          },
        ],
      },
    },
  })
  async dashboard(
    @Query('anio') anio?: number,
    @Query('mes') mes?: number,
  ) {
    return this.reportesService.getDashboardFiscal(anio, mes);
  }

  @Get('exportar/excel')
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiOperation({
    summary: 'Exportar reporte a Excel',
    description: `
      Descarga el reporte de CFDIs en formato Excel (.xlsx).
      
      **El archivo incluye:**
      - Hoja de resumen con totales
      - Hoja de detalle con todos los CFDIs
      - Formato profesional con colores
      - Totales calculados automáticamente
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo Excel generado',
    headers: {
      'Content-Disposition': {
        description: 'Nombre del archivo a descargar',
        schema: { type: 'string', example: 'attachment; filename="reporte-cfdi-2025-10.xlsx"' },
      },
    },
  })
  async exportarExcel(@Query() dto: ReportePeriodoDto) {
    const reporte = await this.reportesService.generarReportePeriodo(dto);
    const buffer = await this.excelService.generarReporte(reporte, dto);

    const fecha_inicio = new Date(dto.fecha_inicio).toISOString().split('T')[0];
    const fecha_fin = new Date(dto.fecha_fin).toISOString().split('T')[0];
    const filename = `reporte-cfdi-${fecha_inicio}_${fecha_fin}.xlsx`;

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
