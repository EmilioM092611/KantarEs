// ============== ordenes/dto/cambiar-estado-item.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { estado_orden_detalle } from '@prisma/client';

export class CambiarEstadoItemDto {
  @ApiProperty({
    enum: estado_orden_detalle,
    example: 'preparando',
    description: 'Nuevo estado del item',
  })
  @IsEnum(estado_orden_detalle)
  estado: estado_orden_detalle;

  @ApiProperty({
    example: 'Se acabó el producto',
    description: 'Motivo de cancelación',
    required: false,
  })
  @IsOptional()
  @IsString()
  motivo_cancelacion?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario que prepara',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id_usuario_prepara?: number;
}
