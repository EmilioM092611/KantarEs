// backend/src/reservaciones/dto/validar-reservacion.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsDateString, IsOptional } from 'class-validator';

export class ValidarReservacionDto {
  @ApiProperty({
    description: 'ID de la mesa a reservar',
    example: 5,
  })
  @IsInt()
  id_mesa: number;

  @ApiProperty({
    description: 'Fecha y hora de inicio (ISO 8601)',
    example: '2025-10-20T19:00:00Z',
  })
  @IsDateString()
  fecha_inicio: string;

  @ApiProperty({
    description: 'Fecha y hora de fin (ISO 8601)',
    example: '2025-10-20T21:00:00Z',
  })
  @IsDateString()
  fecha_fin: string;

  @ApiProperty({
    description: 'ID de reservación a excluir (para validar al actualizar)',
    example: 15,
    required: false,
  })
  @IsOptional()
  @IsInt()
  excluir_id?: number;
}

export class ConflictoReservacionDto {
  @ApiProperty({ example: 12 })
  id_reservacion: number;

  @ApiProperty({ example: 5 })
  id_mesa: number;

  @ApiProperty({ example: 'Mesa 5' })
  numero_mesa: string;

  @ApiProperty({ example: 'Juan Pérez' })
  nombre_cliente: string;

  @ApiProperty({ example: '2025-10-20T19:30:00Z' })
  fecha_inicio: string;

  @ApiProperty({ example: '2025-10-20T21:30:00Z' })
  fecha_fin: string;

  @ApiProperty({ example: 'confirmada' })
  estado: string;

  @ApiProperty({ example: '30 minutos de traslape' })
  descripcion_conflicto: string;
}

export class ValidarReservacionResponseDto {
  @ApiProperty({ example: true })
  valida: boolean;

  @ApiProperty({ example: false })
  tiene_conflictos: boolean;

  @ApiProperty({ type: [ConflictoReservacionDto] })
  conflictos: ConflictoReservacionDto[];

  @ApiProperty({ example: 'La reservación no tiene conflictos' })
  mensaje: string;

  @ApiProperty({ example: '2025-10-15T10:30:00Z' })
  validado_en: string;
}
