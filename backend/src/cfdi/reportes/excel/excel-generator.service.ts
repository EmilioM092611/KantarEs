/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/cfdi/reportes/excel/excel-generator.service.ts

import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ReportePeriodoDto } from '../dto/reporte-periodo.dto';

@Injectable()
export class ExcelGeneratorService {
  private readonly logger = new Logger(ExcelGeneratorService.name);

  /**
   * Generar reporte de CFDIs en formato Excel
   */
  async generarReporte(data: any, filtros: ReportePeriodoDto): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Metadatos del archivo
    workbook.creator = 'KantarEs POS';
    workbook.lastModifiedBy = 'Sistema';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Crear hojas
    this.crearHojaResumen(workbook, data.resumen, filtros);
    this.crearHojaDetalle(workbook, data.cfdis);

    // Generar buffer - ✅ CORREGIDO: Usar tipo correcto
    const buffer = await workbook.xlsx.writeBuffer();
    this.logger.log('Reporte Excel generado exitosamente');
    return Buffer.from(buffer);
  }

  /**
   * Crear hoja de resumen
   */
  private crearHojaResumen(
    workbook: ExcelJS.Workbook,
    resumen: any,
    filtros: ReportePeriodoDto,
  ): void {
    const sheet = workbook.addWorksheet('Resumen', {
      properties: { tabColor: { argb: 'FF2E7D32' } },
    });

    // Configurar ancho de columnas
    sheet.columns = [{ width: 30 }, { width: 20 }];

    // Título
    sheet.mergeCells('A1:B1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'REPORTE FISCAL - CFDI';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' },
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    // Periodo
    sheet.addRow(['']);
    sheet.addRow(['PERIODO DE CONSULTA']);
    sheet.getCell('A3').font = { bold: true, size: 12 };

    sheet.addRow([
      'Fecha Inicio:',
      new Date(filtros.fecha_inicio).toLocaleDateString('es-MX'),
    ]);
    sheet.addRow([
      'Fecha Fin:',
      new Date(filtros.fecha_fin).toLocaleDateString('es-MX'),
    ]);

    // Totales
    sheet.addRow(['']);
    sheet.addRow(['RESUMEN DE FACTURACIÓN']);
    sheet.getCell('A7').font = { bold: true, size: 12 };

    const rows = [
      ['Total de CFDIs:', resumen.total_cfdis],
      ['CFDIs Cancelados:', resumen.total_cancelados],
      ['CFDIs de Ingreso:', resumen.cfdis_ingreso],
      ['CFDIs de Egreso:', resumen.cfdis_egreso],
      ['CFDIs de Pago:', resumen.cfdis_pago],
      [''],
      ['Subtotal:', `$${this.formatCurrency(resumen.subtotal)}`],
      ['Impuestos:', `$${this.formatCurrency(resumen.impuestos)}`],
      ['TOTAL FACTURADO:', `$${this.formatCurrency(resumen.monto_total)}`],
    ];

    rows.forEach((row) => {
      const excelRow = sheet.addRow(row);
      if (row[0] === 'TOTAL FACTURADO:') {
        excelRow.font = { bold: true, size: 12 };
        excelRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEB3B' },
        };
      }
    });

    // Formato de moneda para celdas de totales
    ['B14', 'B15', 'B16'].forEach((cell) => {
      sheet.getCell(cell).alignment = { horizontal: 'right' };
    });

    // Pie de página
    sheet.addRow(['']);
    sheet.addRow(['']);
    const footerRow = sheet.addRow([
      'Generado el:',
      new Date().toLocaleString('es-MX'),
    ]);
    footerRow.font = { italic: true, size: 10 };
  }

  /**
   * Crear hoja de detalle
   */
  private crearHojaDetalle(workbook: ExcelJS.Workbook, cfdis: any[]): void {
    const sheet = workbook.addWorksheet('Detalle de CFDIs', {
      properties: { tabColor: { argb: 'FF1976D2' } },
    });

    // Encabezados
    const headers = [
      'UUID',
      'Tipo',
      'Serie',
      'Folio',
      'RFC Receptor',
      'Razón Social',
      'Fecha Timbrado',
      'Subtotal',
      'Total',
      'Estado',
    ];

    const headerRow = sheet.addRow(headers);

    // Estilo de encabezados
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1976D2' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Configurar ancho de columnas
    sheet.columns = [
      { width: 40 }, // UUID
      { width: 8 }, // Tipo
      { width: 10 }, // Serie
      { width: 10 }, // Folio
      { width: 15 }, // RFC
      { width: 35 }, // Razón Social
      { width: 20 }, // Fecha
      { width: 15 }, // Subtotal
      { width: 15 }, // Total
      { width: 12 }, // Estado
    ];

    // Datos
    cfdis.forEach((cfdi) => {
      const row = sheet.addRow([
        cfdi.uuid || '',
        cfdi.tipo || '',
        cfdi.serie || '',
        cfdi.folio || '',
        cfdi.receptor?.rfc || '',
        cfdi.receptor?.razon_social || '',
        cfdi.fecha_timbrado
          ? new Date(cfdi.fecha_timbrado).toLocaleString('es-MX')
          : '',
        cfdi.subtotal || 0,
        cfdi.total || 0,
        cfdi.estatus || '',
      ]);

      // Formato de moneda
      row.getCell(8).numFmt = '$#,##0.00'; // Subtotal
      row.getCell(9).numFmt = '$#,##0.00'; // Total

      // Color según estado
      if (cfdi.estatus === 'cancelado') {
        row.getCell(10).font = { color: { argb: 'FFD32F2F' }, bold: true };
      } else if (cfdi.estatus === 'timbrado') {
        row.getCell(10).font = { color: { argb: 'FF388E3C' }, bold: true };
      }
    });

    // Fila de totales
    const totalRow = sheet.addRow([
      '',
      '',
      '',
      '',
      '',
      'TOTALES:',
      '',
      { formula: `SUM(H2:H${sheet.rowCount})` },
      { formula: `SUM(I2:I${sheet.rowCount})` },
      '',
    ]);

    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB3B' },
    };
    totalRow.getCell(8).numFmt = '$#,##0.00';
    totalRow.getCell(9).numFmt = '$#,##0.00';

    // Filtros automáticos
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    };

    // Congelar primera fila
    sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  }

  /**
   * Formatear moneda
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
