import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
  IsArray,
  IsPositive,
  IsInt,
} from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @MaxLength(20)
  codigo: string;

  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsInt()
  @IsPositive()
  id_tipo_producto: number;

  @IsNumber()
  @IsPositive()
  precio_venta: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  iva?: number = 16;

  @IsInt()
  @IsPositive()
  id_unidad_medida: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_minimo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_maximo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ubicacion_almacen?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imagen_url?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;

  @IsOptional()
  @IsBoolean()
  disponible_venta?: boolean = true;

  @IsOptional()
  @IsBoolean()
  requiere_preparacion?: boolean = false;

  @IsOptional()
  @IsInt()
  @Min(0)
  tiempo_preparacion_min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  calorias?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredientes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alergenos?: string[];
}
