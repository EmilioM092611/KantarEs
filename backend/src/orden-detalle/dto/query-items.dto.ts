/* eslint-disable @typescript-eslint/no-unsafe-argument */
// ============== query-items.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, IsEnum, IsDate } from 'class-validator';
import { estado_orden_detalle } from '@prisma/client';

export class QueryItemsDto {
  @ApiProperty({ required: false, description: 'Filtrar por estado' })
  @IsOptional()
  @IsEnum(estado_orden_detalle)
  estado?: estado_orden_detalle;

  @ApiProperty({ required: false, description: 'Filtrar por producto' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_producto?: number;

  @ApiProperty({
    required: false,
    description: 'Filtrar por usuario que prepara',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_usuario_prepara?: number;

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
