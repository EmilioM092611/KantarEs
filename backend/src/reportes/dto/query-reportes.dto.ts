import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PeriodoComparacion {
  DIA = 'dia',
  SEMANA = 'semana',
  MES = 'mes',
  ANIO = 'anio',
}

export enum AgrupacionReporte {
  HORA = 'hora',
  DIA = 'dia',
  SEMANA = 'semana',
  MES = 'mes',
  CATEGORIA = 'categoria',
  PRODUCTO = 'producto',
  MESERO = 'mesero',
}

export class QueryReportesBaseDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha fin (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;
}

export class QueryVentasDto extends QueryReportesBaseDto {
  @ApiPropertyOptional({
    description: 'Agrupar por',
    enum: AgrupacionReporte,
    example: 'dia',
  })
  @IsOptional()
  @IsEnum(AgrupacionReporte)
  agrupar_por?: AgrupacionReporte;

  @ApiPropertyOptional({
    description: 'Incluir órdenes canceladas',
    example: false,
  })
  @IsOptional()
  incluir_canceladas?: boolean;
}

export class QueryProductosTopDto extends QueryReportesBaseDto {
  @ApiPropertyOptional({
    description: 'Límite de resultados',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_categoria?: number;
}

export class QueryComparativoDto {
  @ApiPropertyOptional({
    description: 'Periodo a comparar',
    enum: PeriodoComparacion,
    example: 'mes',
  })
  @IsOptional()
  @IsEnum(PeriodoComparacion)
  periodo?: PeriodoComparacion;

  @ApiPropertyOptional({
    description: 'Fecha base para comparación',
    example: '2025-10-01',
  })
  @IsOptional()
  @IsDateString()
  fecha_base?: string;
}

export class QueryAnalisisMeseroDto extends QueryReportesBaseDto {
  @ApiPropertyOptional({
    description: 'Filtrar por mesero específico',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id_mesero?: number;
}

export class QueryHorasPicoDto extends QueryReportesBaseDto {
  @ApiPropertyOptional({
    description: 'Día de la semana (0=Domingo, 6=Sábado)',
    minimum: 0,
    maximum: 6,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  dia_semana?: number;
}
