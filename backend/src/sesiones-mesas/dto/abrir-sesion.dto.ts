// ============== abrir-sesion.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class AbrirSesionDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la mesa',
  })
  @IsNumber()
  id_mesa: number;

  @ApiProperty({
    example: 4,
    description: 'Número de comensales',
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @Max(50)
  numero_comensales: number;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del cliente',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre_cliente?: string;

  @ApiProperty({
    example: 'Cliente VIP',
    description: 'Observaciones',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
