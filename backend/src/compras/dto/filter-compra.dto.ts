//filter-compra.dto.ts
import {
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { estado_compra } from '@prisma/client';

export class FilterCompraDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID de proveedor' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_proveedor?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de usuario solicitante' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_usuario_solicita?: number;

  @ApiPropertyOptional({
    enum: estado_compra,
    description: 'Filtrar por estado',
  })
  @IsOptional()
  @IsEnum(estado_compra)
  estado?: estado_compra;

  @ApiPropertyOptional({ description: 'Fecha inicial (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({ description: 'Fecha final (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiPropertyOptional({ description: 'Buscar por folio' })
  @IsOptional()
  @IsString()
  folio_compra?: string;
}
