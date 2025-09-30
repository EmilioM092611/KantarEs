/* eslint-disable @typescript-eslint/no-unsafe-argument */
// ============== query-ordenes.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsDate,
  IsBoolean,
  IsString,
} from 'class-validator';

export class QueryOrdenesDto {
  @ApiProperty({ required: false, description: 'Filtrar por sesión' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_sesion_mesa?: number;

  @ApiProperty({ required: false, description: 'Filtrar por mesero' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_usuario_mesero?: number;

  @ApiProperty({ required: false, description: 'Filtrar por estado' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_estado_orden?: number;

  @ApiProperty({ required: false, description: 'Filtrar por mesa' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_mesa?: number;

  @ApiProperty({ required: false, description: 'Fecha desde' })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  fecha_desde?: Date;

  @ApiProperty({ required: false, description: 'Fecha hasta' })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  fecha_hasta?: Date;

  @ApiProperty({ required: false, description: 'Solo para llevar' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  para_llevar?: boolean;

  @ApiProperty({ required: false, description: 'Buscar por folio' })
  @IsOptional()
  @IsString()
  folio?: string;

  @ApiProperty({
    required: false,
    description: 'Límite de resultados',
    default: 50,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false, description: 'Offset para paginación' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  offset?: number;
}
