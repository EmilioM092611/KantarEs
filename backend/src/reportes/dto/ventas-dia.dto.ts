// backend/src/reportes/dto/ventas-dia.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class VentasDiaDto {
  @ApiProperty({
    description: 'Fecha de consulta (YYYY-MM-DD)',
    example: '2025-10-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;
}

export class VentasDiaResponseDto {
  @ApiProperty({ example: '2025-10-15' })
  fecha: string;

  @ApiProperty({ example: 87 })
  total_ordenes: number;

  @ApiProperty({ example: 23 })
  mesas_atendidas: number;

  @ApiProperty({ example: 10550.0 })
  subtotal: number;

  @ApiProperty({ example: 450.0 })
  descuentos: number;

  @ApiProperty({ example: 1688.0 })
  iva: number;

  @ApiProperty({ example: 11788.0 })
  total_ventas: number;

  @ApiProperty({ example: 135.5 })
  ticket_promedio: number;
}
