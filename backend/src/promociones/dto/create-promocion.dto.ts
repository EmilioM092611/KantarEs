import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
  Min,
  ValidateIf,
  Matches,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { tipo_promocion, aplicacion_promocion } from '@prisma/client';

export class ProductoPromocionDto {
  @ApiPropertyOptional({
    description: 'ID del producto (requerido si aplicación es "producto")',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_producto?: number;

  @ApiPropertyOptional({
    description: 'ID de la categoría (requerido si aplicación es "categoria")',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_categoria?: number;

  @ApiPropertyOptional({
    description: 'Precio especial para el producto/categoría',
    example: 99.99,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  precio_especial?: number;

  @ApiPropertyOptional({
    description: 'Cantidad requerida para aplicar la promoción',
    example: 2,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  cantidad_requerida?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad bonificada (para 2x1, 3x2, etc.)',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  cantidad_bonificada?: number = 0;
}

export class CreatePromocionDto {
  @ApiProperty({
    description: 'Nombre de la promoción',
    example: 'Happy Hour - 2x1 en cervezas',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la promoción',
    example: 'Compra una cerveza y llévate otra gratis de lunes a viernes',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de promoción',
    enum: tipo_promocion,
    example: tipo_promocion.x1,
  })
  @IsEnum(tipo_promocion)
  tipo: tipo_promocion;

  @ApiProperty({
    description:
      'Valor de la promoción (porcentaje para descuento_porcentaje, monto para descuento_monto, etc.)',
    example: 50,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  valor: number;

  @ApiProperty({
    description: 'Fecha de inicio de la promoción (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString()
  fecha_inicio: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin de la promoción (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional({
    description: 'Hora de inicio (HH:mm:ss)',
    example: '17:00:00',
  })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'hora_inicio debe tener formato HH:mm:ss',
  })
  hora_inicio?: string;

  @ApiPropertyOptional({
    description: 'Hora de fin (HH:mm:ss)',
    example: '21:00:00',
  })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'hora_fin debe tener formato HH:mm:ss',
  })
  hora_fin?: string;

  @ApiPropertyOptional({
    description:
      'Días de la semana aplicables (L,M,Mi,J,V,S,D separados por coma)',
    example: 'L,M,Mi,J,V',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  dias_semana?: string;

  @ApiProperty({
    description: 'A qué se aplica la promoción',
    enum: aplicacion_promocion,
    example: aplicacion_promocion.producto,
  })
  @IsEnum(aplicacion_promocion)
  aplicacion: aplicacion_promocion;

  @ApiPropertyOptional({
    description: 'Monto mínimo de compra para aplicar la promoción',
    example: 100,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  condicion_monto_minimo?: number = 0;

  @ApiPropertyOptional({
    description: 'Cantidad mínima de productos para aplicar la promoción',
    example: 2,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  condicion_cantidad_minima?: number = 1;

  @ApiPropertyOptional({
    description: 'Máximo de usos totales de la promoción',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  maximo_usos_total?: number;

  @ApiPropertyOptional({
    description: 'Máximo de usos por cliente',
    example: 3,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  maximo_usos_cliente?: number = 1;

  @ApiPropertyOptional({
    description: 'Indica si la promoción requiere código',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiere_codigo?: boolean = false;

  @ApiPropertyOptional({
    description:
      'Código de la promoción (requerido si requiere_codigo es true)',
    example: 'VERANO2025',
    maxLength: 20,
  })
  @ValidateIf((o) => o.requiere_codigo === true)
  @IsString()
  @MaxLength(20)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'El código debe contener solo letras mayúsculas y números',
  })
  codigo_promocion?: string;

  @ApiPropertyOptional({
    description: 'Indica si la promoción se puede combinar con otras',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  combinable?: boolean = false;

  @ApiPropertyOptional({
    description: 'Indica si la promoción está activa',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activa?: boolean = true;

  @ApiPropertyOptional({
    description:
      'Productos o categorías asociados a la promoción (solo si aplicación es producto o categoria)',
    type: [ProductoPromocionDto],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoPromocionDto)
  productos_promocion?: ProductoPromocionDto[];
}
