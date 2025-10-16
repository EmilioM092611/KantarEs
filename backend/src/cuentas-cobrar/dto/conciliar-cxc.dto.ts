import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';

export class ConciliarCxCDto {
  @ApiProperty({
    description: 'IDs de los movimientos de abono a conciliar',
    example: [15, 18, 22],
    type: [Number],
  })
  @IsInt({ each: true })
  ids_movimientos: number[];

  @ApiProperty({
    description: 'ID del pago del POS relacionado',
    example: 125,
    required: false,
  })
  @IsOptional()
  @IsInt()
  id_pago?: number;

  @ApiProperty({
    description: 'ID de la orden relacionada',
    example: 340,
    required: false,
  })
  @IsOptional()
  @IsInt()
  id_orden?: number;

  @ApiProperty({
    description: 'Referencia de conciliación',
    example: 'Pago orden #340',
    required: false,
  })
  @IsOptional()
  referencia?: string;
}

export class ConciliarCxCResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Conciliación realizada exitosamente' })
  message: string;

  @ApiProperty({ example: 3 })
  movimientos_conciliados: number;

  @ApiProperty({ example: 1250.5 })
  monto_total_conciliado: number;

  @ApiProperty({ example: '2025-10-15T10:30:00Z' })
  fecha_conciliacion: string;
}
