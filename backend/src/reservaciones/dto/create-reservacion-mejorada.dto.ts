import {
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
  Min,
  IsEmail,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO mejorado para crear reservación
 * Incluye nuevos campos para confirmaciones y recordatorios
 */
export class CreateReservacionMejoradaDto {
  @ApiPropertyOptional({
    description: 'ID de la mesa (opcional si aún no se asigna)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  id_mesa?: number;

  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'María González',
  })
  @IsString()
  nombre_cliente: string;

  @ApiProperty({
    description: 'Teléfono del cliente con código de país',
    example: '+524421234567',
  })
  @IsString()
  telefono: string;

  @ApiPropertyOptional({
    description: 'Email del cliente para confirmaciones',
    example: 'maria.gonzalez@email.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Número de personas',
    example: 4,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  personas: number;

  @ApiProperty({
    description: 'Fecha y hora de inicio de la reservación',
    example: '2025-01-15T19:00:00Z',
  })
  @IsDateString()
  fecha_inicio: string;

  @ApiProperty({
    description: 'Fecha y hora de fin de la reservación',
    example: '2025-01-15T21:00:00Z',
  })
  @IsDateString()
  fecha_fin: string;

  @ApiPropertyOptional({
    description: 'Notas o solicitudes especiales',
    example: 'Mesa cerca de la ventana, celebración de cumpleaños',
  })
  @IsOptional()
  @IsString()
  notas?: string;

  @ApiPropertyOptional({
    description: 'Método de contacto preferido para recordatorios',
    example: 'whatsapp',
    enum: ['whatsapp', 'sms', 'email', 'llamada'],
    default: 'whatsapp',
  })
  @IsOptional()
  @IsIn(['whatsapp', 'sms', 'email', 'llamada'])
  metodo_contacto_preferido?: string;
}

/**
 * Response mejorado para reservación
 */
export class ReservacionResponse {
  @ApiProperty()
  id_reservacion: number;

  @ApiProperty({ required: false })
  id_mesa?: number;

  @ApiProperty()
  nombre_cliente: string;

  @ApiProperty()
  telefono: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty()
  personas: number;

  @ApiProperty()
  fecha_inicio: Date;

  @ApiProperty()
  fecha_fin: Date;

  @ApiProperty()
  estado: string;

  @ApiProperty({ required: false })
  notas?: string;

  @ApiProperty({ required: false })
  confirmada_por_cliente?: boolean;

  @ApiProperty({ required: false })
  fecha_confirmacion?: Date;

  @ApiProperty({ required: false })
  recordatorio_enviado?: boolean;

  @ApiProperty({ required: false })
  fecha_envio_recordatorio?: Date;

  @ApiProperty({ required: false })
  metodo_contacto_preferido?: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  // Información de la mesa si está asignada
  @ApiProperty({ required: false })
  mesa?: {
    numero_mesa: string;
    capacidad_minima: number;
    capacidad_maxima: number;
  };
}
