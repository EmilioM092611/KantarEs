/* eslint-disable @typescript-eslint/no-unsafe-argument */
// ============== query-mesas.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';

export class QueryMesasDto {
  @ApiProperty({ required: false, description: 'Solo mesas activas' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  activa?: boolean;

  @ApiProperty({ required: false, description: 'Filtrar por estado' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  estado?: number;

  @ApiProperty({ required: false, description: 'Filtrar por ubicación' })
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @ApiProperty({ required: false, description: 'Filtrar por planta' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  planta?: number;

  @ApiProperty({ required: false, description: 'Solo disponibles' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  disponibles?: boolean;

  @ApiProperty({ required: false, description: 'Capacidad mínima' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  capacidad_min?: number;
}
