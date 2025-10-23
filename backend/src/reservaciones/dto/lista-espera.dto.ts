import { IsString, IsInt, IsOptional, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para crear entrada en lista de espera
 * POST /reservaciones/lista-espera
 */
export class CreateListaEsperaDto {
  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
  })
  @IsString()
  nombre: string;

  @ApiProperty({
    description: 'Teléfono del cliente',
    example: '+524421234567',
  })
  @IsString()
  telefono: string;

  @ApiProperty({
    description: 'Número de personas',
    example: 4,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  personas: number;

  @ApiPropertyOptional({
    description: 'Tiempo estimado de espera en minutos',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  tiempo_espera_estimado?: number;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
    example: 'Cliente preferente',
  })
  @IsOptional()
  @IsString()
  notas?: string;
}

/**
 * DTO para actualizar lista de espera
 * PATCH /reservaciones/lista-espera/:id
 */
export class UpdateListaEsperaDto {
  @ApiPropertyOptional({
    description: 'Nuevo tiempo estimado de espera en minutos',
    example: 45,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  tiempo_espera_estimado?: number;

  @ApiPropertyOptional({
    description: 'Estado de la lista de espera',
    example: 'notificada',
    enum: ['activa', 'notificada', 'atendida', 'cancelada'],
  })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({
    description: 'Marcar como notificado',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notificado?: boolean;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
    example: 'Cliente notificado por WhatsApp',
  })
  @IsOptional()
  @IsString()
  notas?: string;
}

/**
 * DTO para notificar cliente en lista de espera
 * PATCH /reservaciones/lista-espera/:id/notificar
 */
export class NotificarListaEsperaDto {
  @ApiPropertyOptional({
    description: 'Método de notificación',
    example: 'whatsapp',
    enum: ['whatsapp', 'sms', 'llamada'],
    default: 'whatsapp',
  })
  @IsOptional()
  @IsString()
  metodo?: string;

  @ApiPropertyOptional({
    description: 'Mensaje personalizado',
    example: 'Su mesa está lista. Por favor diríjase al restaurante.',
  })
  @IsOptional()
  @IsString()
  mensaje?: string;
}

/**
 * Response para lista de espera activa
 */
export class ListaEsperaResponse {
  @ApiProperty()
  id_lista_espera: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  telefono: string;

  @ApiProperty()
  personas: number;

  @ApiProperty()
  hora_llegada: Date;

  @ApiProperty()
  tiempo_espera_estimado: number;

  @ApiProperty()
  tiempo_esperado_real: number; // calculado desde hora_llegada

  @ApiProperty()
  notificado: boolean;

  @ApiProperty()
  estado: string;

  @ApiProperty({ required: false })
  notas?: string;

  @ApiProperty()
  posicion_en_lista: number; // calculado
}
