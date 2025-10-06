import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { tipo_promocion, aplicacion_promocion } from '@prisma/client';

export class FilterPromocionDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre, descripción o código',
    example: 'happy hour',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de promoción',
    enum: tipo_promocion,
    example: tipo_promocion.x1,
  })
  @IsOptional()
  @IsEnum(tipo_promocion)
  tipo?: tipo_promocion;

  @ApiPropertyOptional({
    description: 'Filtrar por aplicación',
    enum: aplicacion_promocion,
    example: aplicacion_promocion.producto,
  })
  @IsOptional()
  @IsEnum(aplicacion_promocion)
  aplicacion?: aplicacion_promocion;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo/inactivo',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activa?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar promociones vigentes en esta fecha (YYYY-MM-DD)',
    example: '2025-06-15',
  })
  @IsOptional()
  @IsDateString()
  fecha_vigente?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por código promocional',
    example: 'VERANO2025',
  })
  @IsOptional()
  @IsString()
  codigo_promocion?: string;

  @ApiPropertyOptional({
    description: 'Solo promociones combinables',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  combinable?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de producto asociado',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_producto?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de categoría asociada',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_categoria?: number;

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
    example: 'nombre',
    default: 'nombre',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'nombre';

  @ApiPropertyOptional({
    description: 'Orden ascendente o descendente',
    example: 'asc',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}
