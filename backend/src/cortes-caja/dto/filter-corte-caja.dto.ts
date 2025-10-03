//filter-corte-caja.dto.ts
import {
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { estado_corte } from '@prisma/client';

export class FilterCorteCajaDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID de tipo de corte' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_tipo_corte?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de usuario que realiza' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_usuario_realiza?: number;

  @ApiPropertyOptional({
    enum: estado_corte,
    description: 'Filtrar por estado del corte',
  })
  @IsOptional()
  @IsEnum(estado_corte)
  estado?: estado_corte;

  @ApiPropertyOptional({ description: 'Fecha inicial (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({ description: 'Fecha final (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiPropertyOptional({ description: 'Buscar por folio de corte' })
  @IsOptional()
  @IsString()
  folio_corte?: string;
}
