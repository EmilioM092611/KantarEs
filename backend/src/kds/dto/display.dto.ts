// backend/src/kds/dto/display.dto.ts

import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoLayout, Theme } from '../interfaces/kds.interface';

export class CrearDisplayDto {
  @ApiProperty({ example: 'KDS Cocina Principal' })
  @IsString()
  @Length(1, 100)
  nombre_display: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  id_estacion: number;

  @ApiPropertyOptional({ example: '192.168.1.100' })
  @IsString()
  @IsOptional()
  ip_address?: string;

  @ApiPropertyOptional({ example: '00:11:22:33:44:55' })
  @IsString()
  @IsOptional()
  mac_address?: string;

  @ApiProperty({ enum: TipoLayout, example: TipoLayout.GRID })
  @IsEnum(TipoLayout)
  layout_tipo: TipoLayout;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  @Max(6)
  columnas: number;

  @ApiProperty({ enum: Theme, example: Theme.DARK })
  @IsEnum(Theme)
  theme: Theme;

  @ApiProperty({ example: 'medium' })
  @IsEnum(['small', 'medium', 'large'])
  tamano_fuente: 'small' | 'medium' | 'large';

  @ApiProperty({ example: false })
  @IsBoolean()
  mostrar_imagenes: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  permite_cambiar_prioridad: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  permite_cancelar: boolean;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(60)
  auto_refresh_segundos: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  bump_bar_habilitado: boolean;

  @ApiPropertyOptional({ example: 'COM3' })
  @IsString()
  @IsOptional()
  bump_bar_puerto?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  activo: boolean;
}

export class ActualizarDisplayDto extends CrearDisplayDto {}
