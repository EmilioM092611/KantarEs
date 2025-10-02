//filter-pago.dto.ts
import {
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { estado_pago } from '@prisma/client';

export class FilterPagoDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID de orden' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_orden?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de método de pago' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_metodo_pago?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de usuario que cobra' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_usuario_cobra?: number;

  @ApiPropertyOptional({
    enum: estado_pago,
    description: 'Filtrar por estado',
  })
  @IsOptional()
  @IsEnum(estado_pago)
  estado?: estado_pago;

  @ApiPropertyOptional({ description: 'Fecha inicial (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({ description: 'Fecha final (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiPropertyOptional({ description: 'Filtrar por corte de caja' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_corte_caja?: number;

  @ApiPropertyOptional({ description: 'Buscar por folio de pago' })
  @IsOptional()
  @IsString()
  folio_pago?: string;
}
