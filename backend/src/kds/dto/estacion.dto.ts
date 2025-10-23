import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CrearEstacionDto {
  @ApiProperty({ example: 'Cocina Caliente' })
  @IsString()
  @Length(1, 50)
  nombre: string;

  @ApiPropertyOptional({ example: 'Parrilla, freidora, hornos' })
  @IsString()
  @IsOptional()
  @Length(0, 200)
  descripcion?: string;

  @ApiProperty({ example: '#EF4444' })
  @IsString()
  @Length(7, 7)
  color_hex: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  orden_visualizacion: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  muestra_todas_ordenes: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  muestra_solo_asignadas: boolean;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsArray()
  @IsOptional()
  filtro_categorias?: number[];

  @ApiPropertyOptional({ example: [1, 2] })
  @IsArray()
  @IsOptional()
  filtro_tipos_producto?: number[];

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(1)
  @Max(60)
  tiempo_alerta_minutos: number;

  @ApiProperty({ example: 'ding.mp3' })
  @IsString()
  sonido_alerta: string;

  @ApiProperty({ example: 6 })
  @IsNumber()
  @Min(1)
  @Max(20)
  items_por_pagina: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  mostrar_notas: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  mostrar_mesero: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  mostrar_tiempo: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  activo: boolean;
}

export class ActualizarEstacionDto extends CrearEstacionDto {}
