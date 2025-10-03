//create-compra-detalle.dto.ts
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateCompraDetalleDto {
  @ApiProperty({ example: 1, description: 'ID del producto' })
  @IsInt()
  @Type(() => Number)
  id_producto: number;

  @ApiProperty({ example: '100.0000', description: 'Cantidad pedida' })
  @IsNumber()
  @Type(() => Number)
  @Min(0.0001)
  cantidad_pedida: number | Decimal;

  @ApiPropertyOptional({
    example: '100.0000',
    description: 'Cantidad recibida (al recepcionar)',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  cantidad_recibida?: number | Decimal;

  @ApiProperty({ example: 1, description: 'ID de la unidad de medida' })
  @IsInt()
  @Type(() => Number)
  id_unidad_medida: number;

  @ApiProperty({ example: '50.5000', description: 'Precio unitario' })
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  precio_unitario: number | Decimal;

  @ApiPropertyOptional({
    example: '5.00',
    description: 'Descuento en porcentaje',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  descuento_porcentaje?: number | Decimal;

  @ApiPropertyOptional({
    example: '10.00',
    description: 'Descuento en monto fijo',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  descuento_monto?: number | Decimal;

  @ApiPropertyOptional({ example: 'LOTE-2024-001', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lote?: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Fecha de caducidad',
  })
  @IsOptional()
  @IsDateString()
  fecha_caducidad?: string;

  @ApiPropertyOptional({ example: 'Producto en buen estado' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
