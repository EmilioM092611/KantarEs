// backend/src/notificaciones/dto/send-notification.dto.ts

import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TipoNotificacion,
  CanalNotificacion,
  PrioridadNotificacion,
} from '../interfaces/notification.interface';

export class SendNotificationDto {
  @ApiProperty({
    enum: TipoNotificacion,
    example: TipoNotificacion.ORDEN_NUEVA,
  })
  @IsEnum(TipoNotificacion)
  tipo: TipoNotificacion;

  @ApiProperty({ example: 'Nueva orden #ORD-001234' })
  @IsString()
  titulo: string;

  @ApiProperty({ example: 'Mesa 5 - 3 items - Total $450.00' })
  @IsString()
  mensaje: string;

  @ApiProperty({ enum: CanalNotificacion, example: CanalNotificacion.COCINA })
  @IsEnum(CanalNotificacion)
  canal: CanalNotificacion;

  @ApiPropertyOptional({
    enum: PrioridadNotificacion,
    example: PrioridadNotificacion.ALTA,
  })
  @IsEnum(PrioridadNotificacion)
  @IsOptional()
  prioridad?: PrioridadNotificacion;

  @ApiPropertyOptional({ example: { id_orden: 123, items: 3 } })
  @IsObject()
  @IsOptional()
  data?: any;

  @ApiPropertyOptional({ example: 123 })
  @IsNumber()
  @IsOptional()
  id_orden?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @IsOptional()
  id_mesa?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsNumber()
  @IsOptional()
  id_producto?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  id_usuario_destinatario?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  id_usuario_origen?: number;

  @ApiPropertyOptional({ example: 30, description: 'Minutos antes de expirar' })
  @IsNumber()
  @IsOptional()
  expira_en_minutos?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  requiere_confirmacion?: boolean;

  @ApiPropertyOptional({ example: 'ding.mp3' })
  @IsString()
  @IsOptional()
  sonido?: string;
}

export class MarcarLeidaDto {
  @ApiProperty({ example: 12345 })
  @IsNumber()
  id_notificacion: number;
}

export class EnviarChatDto {
  @ApiProperty({ example: 'Hola equipo, necesito apoyo en mesa 8' })
  @IsString()
  mensaje: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'ID del destinatario (opcional para broadcast)',
  })
  @IsNumber()
  @IsOptional()
  id_usuario_destinatario?: number;
}
