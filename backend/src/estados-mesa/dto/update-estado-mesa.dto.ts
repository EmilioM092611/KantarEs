// backend/src/estados-mesa/dto/update-estado-mesa.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class UpdateEstadoMesaDto {
  @ApiProperty({
    description: 'Nombre del estado de mesa',
    example: 'Disponible',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nombre?: string;

  @ApiProperty({
    description: 'Color hexadecimal (#RRGGBB)',
    example: '#10B981',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Debe ser un color hexadecimal válido',
  })
  color_hex?: string;

  @ApiProperty({
    description: 'Icono representativo',
    example: 'check-circle',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icono?: string;
}
