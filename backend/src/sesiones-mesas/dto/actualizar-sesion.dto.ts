// ============== actualizar-sesion.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class ActualizarSesionDto {
  @ApiProperty({
    example: 6,
    description: 'Actualizar número de comensales',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  numero_comensales?: number;

  @ApiProperty({
    example: 'María García',
    description: 'Actualizar nombre del cliente',
    required: false,
  })
  @IsOptional()
  @IsString()
  nombre_cliente?: string;

  @ApiProperty({
    example: 'Celebración de cumpleaños',
    description: 'Actualizar observaciones',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
