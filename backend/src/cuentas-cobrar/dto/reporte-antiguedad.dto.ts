import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class ReporteAntiguedadDto {
  @ApiProperty({
    description: 'ID de la persona (opcional, para reporte individual)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_persona?: number;

  @ApiProperty({
    description: 'Fecha de corte para el reporte',
    example: '2025-10-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha_corte?: string;
}

export class RangoAntiguedadDto {
  @ApiProperty({ example: '0-30 días' })
  rango: string;

  @ApiProperty({ example: 5 })
  cantidad_cuentas: number;

  @ApiProperty({ example: 15750.0 })
  saldo_total: number;

  @ApiProperty({ example: 42.5 })
  porcentaje_total: number;
}

export class ClienteAntiguedadDto {
  @ApiProperty({ example: 5 })
  id_persona: number;

  @ApiProperty({ example: 'Juan Pérez García' })
  nombre_cliente: string;

  @ApiProperty({ example: 3 })
  cuentas_pendientes: number;

  @ApiProperty({ example: 8500.0 })
  saldo_total: number;

  @ApiProperty({ example: 45 })
  dias_vencido_promedio: number;

  @ApiProperty({ example: '31-60 días' })
  clasificacion_riesgo: string;
}

export class ReporteAntiguedadResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '2025-10-15' })
  fecha_corte: string;

  @ApiProperty({ example: 37050.0 })
  saldo_total_general: number;

  @ApiProperty({ type: [RangoAntiguedadDto] })
  por_rango: RangoAntiguedadDto[];

  @ApiProperty({ type: [ClienteAntiguedadDto] })
  por_cliente: ClienteAntiguedadDto[];

  @ApiProperty({ example: '2025-10-15T10:30:00Z' })
  generado_en: string;
}
