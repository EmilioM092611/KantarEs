import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryRecetasDto {
  @ApiPropertyOptional({
    description: 'ID del producto final para filtrar',
    example: 25,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_producto_final?: number;

  @ApiPropertyOptional({
    description: 'ID del insumo para buscar en qué recetas se usa',
    example: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_insumo?: number;

  @ApiPropertyOptional({
    description: 'Solo recetas con costo calculado',
    example: true,
  })
  @IsOptional()
  con_costo?: boolean;
}
