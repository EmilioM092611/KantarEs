// src/cfdi/reportes/dto/reporte-periodo.dto.ts

import { IsDateString, IsOptional, IsIn, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportePeriodoDto {
  @ApiProperty({
    description: 'Fecha de inicio del periodo (formato ISO 8601)',
    example: '2025-01-01',
  })
  @IsDateString()
  fecha_inicio: string;

  @ApiProperty({
    description: 'Fecha de fin del periodo (formato ISO 8601)',
    example: '2025-01-31',
  })
  @IsDateString()
  fecha_fin: string;

  @ApiPropertyOptional({
    description: 'Tipo de CFDI a reportar',
    enum: ['I', 'P', 'E', 'todos'],
    default: 'todos',
  })
  @IsOptional()
  @IsIn(['I', 'P', 'E', 'todos'])
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Estado del CFDI',
    enum: ['timbrado', 'cancelado', 'todos'],
    default: 'timbrado',
  })
  @IsOptional()
  @IsIn(['timbrado', 'cancelado', 'todos'])
  estado?: string;

  @ApiPropertyOptional({
    description: 'RFC del receptor (filtro opcional)',
    example: 'XAXX010101000',
  })
  @IsOptional()
  @IsString()
  rfc_receptor?: string;

  @ApiPropertyOptional({
    description: 'Formato de exportación',
    enum: ['json', 'excel', 'pdf'],
    default: 'json',
  })
  @IsOptional()
  @IsIn(['json', 'excel', 'pdf'])
  formato?: string;
}

export class FiltrosReporteDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  pagina?: number;

  @ApiPropertyOptional({
    description: 'Registros por página',
    default: 50,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limite?: number;

  @ApiPropertyOptional({
    description: 'Campo para ordenar',
    enum: ['fecha_timbrado', 'total', 'folio_fiscal'],
    default: 'fecha_timbrado',
  })
  @IsOptional()
  @IsIn(['fecha_timbrado', 'total', 'folio_fiscal'])
  orden_por?: string;

  @ApiPropertyOptional({
    description: 'Dirección de orden',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  direccion?: string;
}

export class ReporteResumenDto {
  @ApiProperty({ description: 'Fecha de inicio del periodo' })
  fecha_inicio: string;

  @ApiProperty({ description: 'Fecha de fin del periodo' })
  fecha_fin: string;

  @ApiProperty({ description: 'Total de CFDIs emitidos' })
  total_cfdis: number;

  @ApiProperty({ description: 'Total de CFDIs cancelados' })
  total_cancelados: number;

  @ApiProperty({ description: 'Monto total facturado' })
  monto_total: number;

  @ApiProperty({ description: 'Subtotal sin impuestos' })
  subtotal: number;

  @ApiProperty({ description: 'Total de impuestos' })
  impuestos: number;

  @ApiProperty({ description: 'CFDIs de tipo Ingreso' })
  cfdis_ingreso: number;

  @ApiProperty({ description: 'CFDIs de tipo Egreso' })
  cfdis_egreso: number;

  @ApiProperty({ description: 'CFDIs de tipo Pago' })
  cfdis_pago: number;
}
