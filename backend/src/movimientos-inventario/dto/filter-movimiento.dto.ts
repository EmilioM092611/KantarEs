//filter-movimiento.dto.ts
import {
  IsOptional,
  IsInt,
  IsDateString,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { afecta_inventario } from '@prisma/client';

export class FilterMovimientoDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID de producto' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_producto?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de tipo de movimiento' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_tipo_movimiento?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de usuario' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_usuario?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de compra' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_compra?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de orden' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_orden?: number;

  @ApiPropertyOptional({
    enum: afecta_inventario,
    description: 'Filtrar por tipo de afectación',
  })
  @IsOptional()
  @IsEnum(afecta_inventario)
  afecta?: afecta_inventario;

  @ApiPropertyOptional({ description: 'Fecha inicial (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({ description: 'Fecha final (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiPropertyOptional({ description: 'Buscar por lote' })
  @IsOptional()
  @IsString()
  lote?: string;
}
