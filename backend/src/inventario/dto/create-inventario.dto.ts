//create-inventario.dto.ts
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateInventarioDto {
  @ApiProperty({ example: 1, description: 'ID del producto' })
  @IsInt()
  @Type(() => Number)
  id_producto: number;

  @ApiPropertyOptional({ example: '100.0000', description: 'Stock actual' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  stock_actual?: number | Decimal;

  @ApiProperty({ example: '10.0000', description: 'Stock mínimo para alerta' })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  stock_minimo: number | Decimal;

  @ApiPropertyOptional({ example: '500.0000', description: 'Stock máximo' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  stock_maximo?: number | Decimal;

  @ApiPropertyOptional({
    example: '50.0000',
    description: 'Punto de reorden (cuando ordenar más)',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  punto_reorden?: number | Decimal;

  @ApiPropertyOptional({ example: 'Anaquel A3', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ubicacion_almacen?: string;

  @ApiPropertyOptional({ example: 'LOTE-2024-001', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lote_actual?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  requiere_refrigeracion?: boolean;

  @ApiPropertyOptional({ example: 30, description: 'Días hasta caducidad' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  dias_caducidad?: number;
}
