// backend/src/estados-orden/dto/update-estado-orden.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateEstadoOrdenDto {
  @ApiProperty({
    description: 'Nombre del estado de orden',
    example: 'En Preparación',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nombre?: string;

  @ApiProperty({
    description: 'Descripción del estado',
    example: 'Orden en proceso de preparación en cocina',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;
}
