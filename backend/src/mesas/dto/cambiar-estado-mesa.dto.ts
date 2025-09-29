// ============== cambiar-estado-mesa.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CambiarEstadoMesaDto {
  @ApiProperty({
    example: 1,
    description: 'ID del estado (1-5)',
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  id_estado_mesa: number;

  @ApiProperty({
    example: false,
    description: 'Requiere limpieza',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  requiere_limpieza?: boolean;
}
