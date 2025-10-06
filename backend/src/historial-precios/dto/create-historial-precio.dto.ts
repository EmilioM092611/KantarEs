import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHistorialPrecioDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  id_producto: number;

  @ApiProperty({
    description: 'Precio anterior del producto',
    example: 120.5,
    minimum: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  precio_anterior: number;

  @ApiProperty({
    description: 'Precio nuevo del producto',
    example: 150.0,
    minimum: 0,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  precio_nuevo: number;

  @ApiProperty({
    description: 'ID del usuario que realiza el cambio',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  id_usuario_modifica: number;

  @ApiPropertyOptional({
    description: 'Motivo del cambio de precio',
    example: 'Ajuste por inflación',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivo_cambio?: string;

  @ApiProperty({
    description: 'Fecha de inicio de vigencia del nuevo precio (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString()
  fecha_vigencia_inicio: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin de vigencia del precio (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  fecha_vigencia_fin?: string;
}
