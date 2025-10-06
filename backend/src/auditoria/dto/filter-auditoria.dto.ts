import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccionAuditoria } from './create-auditoria.dto';

export class FilterAuditoriaDto {
  @ApiPropertyOptional({
    description: 'Filtrar por nombre de tabla afectada',
    example: 'productos',
  })
  @IsOptional()
  @IsString()
  tabla_afectada?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de registro',
    example: 123,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_registro?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de acción',
    enum: AccionAuditoria,
    example: AccionAuditoria.UPDATE,
  })
  @IsOptional()
  @IsEnum(AccionAuditoria)
  accion?: AccionAuditoria;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de usuario que realizó la acción',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id_usuario?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por dirección IP',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiPropertyOptional({
    description: 'Fecha desde (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Resultados por página',
    example: 20,
    minimum: 1,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Campo por el que ordenar',
    example: 'fecha_hora',
    default: 'fecha_hora',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'fecha_hora';

  @ApiPropertyOptional({
    description: 'Orden ascendente o descendente',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
