//create-movimiento.dto.ts
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

export class CreateMovimientoDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de movimiento' })
  @IsInt()
  @Type(() => Number)
  id_tipo_movimiento: number;

  @ApiProperty({ example: 1, description: 'ID del producto' })
  @IsInt()
  @Type(() => Number)
  id_producto: number;

  @ApiProperty({ example: 1, description: 'ID del usuario que registra' })
  @IsInt()
  @Type(() => Number)
  id_usuario: number;

  @ApiProperty({ example: '50.0000', description: 'Cantidad del movimiento' })
  @IsNumber()
  @Type(() => Number)
  @Min(0.0001)
  cantidad: number | Decimal;

  @ApiProperty({ example: 1, description: 'ID de la unidad de medida' })
  @IsInt()
  @Type(() => Number)
  id_unidad_medida: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la compra relacionada',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_compra?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la orden relacionada',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_orden?: number;

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

  @ApiPropertyOptional({ example: '45.5000', description: 'Costo unitario' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  costo_unitario?: number | Decimal;

  @ApiPropertyOptional({ example: 'Entrada por compra' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de movimiento de referencia (para ajustes)',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_movimiento_referencia?: number;
}
