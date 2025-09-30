// ============== cambiar-estado-orden.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CambiarEstadoOrdenDto {
  @ApiProperty({
    example: 2,
    description: 'ID del nuevo estado',
  })
  @IsNumber()
  id_estado_orden: number;

  @ApiProperty({
    example: 'Cliente canceló',
    description: 'Motivo del cambio',
    required: false,
  })
  @IsOptional()
  @IsString()
  motivo?: string;
}
