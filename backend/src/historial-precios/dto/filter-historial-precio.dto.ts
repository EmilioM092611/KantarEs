import {
  IsOptional,
  IsNumber,
  IsDateString,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterHistorialPrecioDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de producto',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_producto?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de usuario que realizó el cambio',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_usuario_modifica?: number;

  @ApiPropertyOptional({
    description: 'Fecha desde (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Resultados por página',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo por el que ordenar',
    example: 'fecha_cambio',
    default: 'fecha_cambio',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'fecha_cambio';

  @ApiPropertyOptional({
    description: 'Orden ascendente o descendente',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
