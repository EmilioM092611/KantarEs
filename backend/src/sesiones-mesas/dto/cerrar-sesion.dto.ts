// ============== cerrar-sesion.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CerrarSesionDto {
  @ApiProperty({
    example: 'Mesa abandonada',
    description: 'Motivo de cancelación (si aplica)',
    required: false,
  })
  @IsOptional()
  @IsString()
  motivo_cancelacion?: string;
}
