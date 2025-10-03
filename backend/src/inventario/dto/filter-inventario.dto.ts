//filter-inventario.dto.ts
import {
  IsOptional,
  IsInt,
  IsBoolean,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum StockStatus {
  CRITICO = 'critico',
  BAJO = 'bajo',
  NORMAL = 'normal',
  EXCESO = 'exceso',
}

export class FilterInventarioDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID de producto' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_producto?: number;

  @ApiPropertyOptional({
    enum: StockStatus,
    description: 'Filtrar por estado de stock',
  })
  @IsOptional()
  @IsEnum(StockStatus)
  estado?: StockStatus;

  @ApiPropertyOptional({
    description: 'Filtrar productos que requieren refrigeración',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  requiere_refrigeracion?: boolean;

  @ApiPropertyOptional({ description: 'Buscar por ubicación en almacén' })
  @IsOptional()
  @IsString()
  ubicacion_almacen?: string;

  @ApiPropertyOptional({
    description: 'Solo productos bajo stock mínimo',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  solo_bajo_stock?: boolean;

  @ApiPropertyOptional({
    description: 'Solo productos en punto de reorden',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  punto_reorden_alcanzado?: boolean;
}
