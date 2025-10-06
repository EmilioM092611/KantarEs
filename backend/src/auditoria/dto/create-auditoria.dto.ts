import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsIP,
  MaxLength,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AccionAuditoria {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export class CreateAuditoriaDto {
  @ApiProperty({
    description: 'Nombre de la tabla afectada',
    example: 'productos',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  tabla_afectada: string;

  @ApiProperty({
    description: 'ID del registro afectado',
    example: 123,
  })
  @IsNumber()
  @Type(() => Number)
  id_registro: number;

  @ApiProperty({
    description: 'Tipo de acción realizada',
    enum: AccionAuditoria,
    example: AccionAuditoria.UPDATE,
  })
  @IsEnum(AccionAuditoria)
  accion: AccionAuditoria;

  @ApiProperty({
    description: 'ID del usuario que realizó la acción',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  id_usuario: number;

  @ApiPropertyOptional({
    description: 'Valores anteriores del registro (JSON)',
    example: { nombre: 'Producto A', precio: 100 },
  })
  @IsOptional()
  @IsObject()
  valores_anteriores?: any;

  @ApiPropertyOptional({
    description: 'Valores nuevos del registro (JSON)',
    example: { nombre: 'Producto A', precio: 120 },
  })
  @IsOptional()
  @IsObject()
  valores_nuevos?: any;

  @ApiPropertyOptional({
    description: 'Dirección IP desde donde se realizó la acción',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsIP()
  ip_address?: string;

  @ApiPropertyOptional({
    description: 'User agent del navegador/cliente',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  user_agent?: string;
}
