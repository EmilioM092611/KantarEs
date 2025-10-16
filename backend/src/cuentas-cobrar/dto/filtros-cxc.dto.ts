// backend/src/cuentas-cobrar/dto/filtros-cxc.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum EstadoCuentaCobrar {
  ABIERTA = 'abierta',
  PARCIAL = 'parcial',
  LIQUIDADA = 'liquidada',
}

export class FiltrosCxCDto {
  @ApiProperty({
    description: 'ID de la persona/cliente',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id_persona?: number;

  @ApiProperty({
    description: 'Estado de la cuenta',
    enum: EstadoCuentaCobrar,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoCuentaCobrar)
  estado?: EstadoCuentaCobrar;

  @ApiProperty({
    description: 'Fecha inicio del rango (YYYY-MM-DD)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiProperty({
    description: 'Fecha fin del rango (YYYY-MM-DD)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiProperty({
    description: 'Resultados por página',
    example: 20,
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
