// backend/src/estados-mesa/dto/create-estado-mesa.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateEstadoMesaDto {
  @ApiProperty({
    description: 'Nombre del estado de mesa',
    example: 'Disponible',
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(30, { message: 'El nombre no puede exceder 30 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Color hexadecimal para representar el estado (#RRGGBB)',
    example: '#10B981',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Debe ser un color hexadecimal válido (ejemplo: #10B981)',
  })
  color_hex?: string;

  @ApiProperty({
    description: 'Icono representativo del estado',
    example: 'check-circle',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El icono no puede exceder 50 caracteres' })
  icono?: string;
}
