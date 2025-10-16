/* eslint-disable @typescript-eslint/no-unsafe-argument */
// backend/src/reportes/dto/sugerencias-compra.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class SugerenciasCompraDto {
  @ApiPropertyOptional({
    description: 'Número de días a analizar para calcular consumo promedio',
    example: 30,
    default: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  @Transform(({ value }) => parseInt(value, 10))
  dias_analisis?: number;

  @ApiPropertyOptional({
    description:
      'Filtrar solo productos con prioridad específica (URGENTE, PRONTO, NORMAL)',
    example: 'URGENTE',
  })
  @IsOptional()
  prioridad?: 'URGENTE' | 'PRONTO' | 'NORMAL';

  @ApiPropertyOptional({
    description:
      'Incluir solo productos con stock actual menor o igual a este valor',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  stock_maximo?: number;
}
