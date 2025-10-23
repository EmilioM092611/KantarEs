import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para consultar disponibilidad de mesas
 * GET /reservaciones/disponibilidad
 */
export class DisponibilidadQueryDto {
  @ApiProperty({
    description: 'Fecha de la reservación (YYYY-MM-DD)',
    example: '2025-01-15',
  })
  @IsDateString()
  fecha: string;

  @ApiProperty({
    description: 'Hora de inicio (HH:mm)',
    example: '19:30',
  })
  hora: string;

  @ApiProperty({
    description: 'Número de personas',
    example: 4,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  personas: number;

  @ApiPropertyOptional({
    description: 'Duración estimada en minutos (por defecto 120)',
    example: 120,
    default: 120,
  })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Type(() => Number)
  duracion?: number;
}

/**
 * DTO para consultar el calendario mensual
 * GET /reservaciones/calendario
 */
export class CalendarioQueryDto {
  @ApiProperty({
    description: 'Mes (1-12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  mes: number;

  @ApiProperty({
    description: 'Año',
    example: 2025,
    minimum: 2020,
  })
  @IsInt()
  @Min(2020)
  @Type(() => Number)
  anio: number;
}

/**
 * DTO para bloquear una mesa
 * POST /reservaciones/bloquearmesa
 */
export class BloquearMesaDto {
  @ApiProperty({
    description: 'ID de la mesa a bloquear',
    example: 5,
  })
  @IsInt()
  @Min(1)
  id_mesa: number;

  @ApiProperty({
    description: 'Fecha y hora de inicio del bloqueo',
    example: '2025-01-15T19:00:00Z',
  })
  @IsDateString()
  fecha_inicio: string;

  @ApiProperty({
    description: 'Fecha y hora de fin del bloqueo',
    example: '2025-01-15T22:00:00Z',
  })
  @IsDateString()
  fecha_fin: string;

  @ApiProperty({
    description: 'Motivo del bloqueo',
    example: 'Mantenimiento programado',
  })
  motivo: string;
}

/**
 * DTO para historial de cliente
 * GET /reservaciones/historial-cliente
 */
export class HistorialClienteQueryDto {
  @ApiProperty({
    description: 'Teléfono del cliente',
    example: '+524421234567',
  })
  telefono: string;

  @ApiPropertyOptional({
    description: 'Límite de resultados',
    example: 10,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limite?: number;
}

/**
 * DTO para confirmar reservación
 * POST /reservaciones/confirmar/:id
 */
export class ConfirmarReservacionDto {
  @ApiPropertyOptional({
    description: 'Email del cliente (si desea actualizar)',
    example: 'cliente@ejemplo.com',
  })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Método de contacto preferido para recordatorios',
    example: 'whatsapp',
    enum: ['whatsapp', 'sms', 'email', 'llamada'],
  })
  @IsOptional()
  metodo_contacto_preferido?: string;
}
