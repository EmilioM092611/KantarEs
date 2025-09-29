/* eslint-disable @typescript-eslint/no-unsafe-argument */
// ============== query-sesiones.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsEnum, IsNumber, IsDate } from 'class-validator';
import { estado_sesion } from '@prisma/client';

export class QuerySesionesDto {
  @ApiProperty({
    required: false,
    enum: estado_sesion,
    description: 'Filtrar por estado',
  })
  @IsOptional()
  @IsEnum(estado_sesion)
  estado?: estado_sesion;

  @ApiProperty({
    required: false,
    description: 'Filtrar por mesa',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_mesa?: number;

  @ApiProperty({
    required: false,
    description: 'Filtrar por usuario',
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  id_usuario?: number;

  @ApiProperty({
    required: false,
    description: 'Fecha desde',
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  fecha_desde?: Date;

  @ApiProperty({
    required: false,
    description: 'Fecha hasta',
  })
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  fecha_hasta?: Date;
}
