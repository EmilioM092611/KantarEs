import { IsEnum, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AccionCompra {
  GUARDAR_BORRADOR = 'guardar_borrador',
  ENVIAR = 'enviar',
  APROBAR = 'aprobar',
  RECHAZAR = 'rechazar',
  MARCAR_PAGADA = 'marcar_pagada',
  CANCELAR = 'cancelar',
}

export class CambiarEstadoCompraDto {
  @ApiProperty({
    description: 'Acción a realizar sobre la compra',
    enum: AccionCompra,
    example: AccionCompra.ENVIAR,
  })
  @IsEnum(AccionCompra)
  accion: AccionCompra;

  @ApiPropertyOptional({
    description: 'ID del usuario que realiza el cambio',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  id_usuario?: number;

  @ApiPropertyOptional({
    description: 'Observaciones sobre el cambio de estado',
    example: 'Aprobado por gerencia',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
