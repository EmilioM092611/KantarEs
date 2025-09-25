import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsBoolean,
  IsEnum,
} from 'class-validator';

enum OrdenProductos {
  nombre = 'nombre',
  precio = 'precio_venta',
  codigo = 'sku', // Cambiado a 'sku' que es el campo real
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  stock = 'nombre', // Temporalmente usar nombre ya que stock está en otra tabla
  createdAt = 'created_at',
}

enum OrdenDireccion {
  asc = 'asc',
  desc = 'desc',
}

export class QueryProductosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoria?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  disponible?: boolean;

  @IsOptional()
  @IsEnum(OrdenProductos)
  ordenarPor?: keyof typeof OrdenProductos = 'nombre';

  @IsOptional()
  @IsEnum(OrdenDireccion)
  orden?: 'asc' | 'desc' = 'asc';
}
