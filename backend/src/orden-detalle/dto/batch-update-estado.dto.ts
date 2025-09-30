// ============== batch-update-estado.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { estado_orden_detalle } from '@prisma/client';

export class BatchUpdateEstadoDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'IDs de los items a actualizar',
  })
  @IsArray()
  @ArrayMinSize(1)
  itemIds: number[];

  @ApiProperty({
    enum: estado_orden_detalle,
    example: 'listo',
    description: 'Nuevo estado para todos los items',
  })
  @IsEnum(estado_orden_detalle)
  estado: estado_orden_detalle;

  @ApiProperty({
    example: 'Productos listos',
    description: 'Motivo del cambio',
    required: false,
  })
  @IsOptional()
  @IsString()
  motivo?: string;
}
