/* eslint-disable @typescript-eslint/no-unsafe-argument */
// backend/src/productos/recetas/dto/query-recetas.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryRecetasDto {
  @ApiPropertyOptional({
    description:
      'Incluir solo recetas válidas (sin ciclos, con insumos disponibles)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  solo_validas?: boolean;

  @ApiPropertyOptional({
    description: 'Incluir cálculo de costos',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  incluir_costos?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por porcentaje de merma máximo',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  merma_maxima?: number;
}
