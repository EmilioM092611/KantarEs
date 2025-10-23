// backend/src/impresion/dto/configurar-impresora.dto.ts

import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoImpresora, TipoConexion } from '../interfaces/impresion.interface';

export class ConfigurarImpresoraDto {
  @ApiProperty({ example: 'Cocina Principal' })
  @IsString()
  nombre: string;

  @ApiProperty({ enum: TipoImpresora, example: TipoImpresora.TERMICA })
  @IsEnum(TipoImpresora)
  tipo: TipoImpresora;

  @ApiProperty({ enum: TipoConexion, example: TipoConexion.RED })
  @IsEnum(TipoConexion)
  tipo_conexion: TipoConexion;

  @ApiPropertyOptional({ example: '192.168.1.100' })
  @IsString()
  @IsOptional()
  ip_address?: string;

  @ApiPropertyOptional({ example: 9100 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(65535)
  puerto?: number;

  @ApiPropertyOptional({ example: '/dev/usb/lp0' })
  @IsString()
  @IsOptional()
  ruta_usb?: string;

  @ApiPropertyOptional({ example: '00:11:22:33:44:55' })
  @IsString()
  @IsOptional()
  mac_address?: string;

  @ApiProperty({ example: 'cocina' })
  @IsString()
  estacion: string;

  @ApiProperty({ example: 80, enum: [58, 80, 110] })
  @IsNumber()
  ancho_papel: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  auto_corte: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  auto_imprimir: boolean;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  @Max(5)
  copias: number;

  @ApiPropertyOptional({ example: 'default' })
  @IsString()
  @IsOptional()
  template_comanda?: string;

  @ApiPropertyOptional({ example: 'default' })
  @IsString()
  @IsOptional()
  template_ticket?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  activa: boolean;
}
