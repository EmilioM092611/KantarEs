// backend/src/estados-orden/dto/create-estado-orden.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateEstadoOrdenDto {
  @ApiProperty({
    description: 'Nombre del estado de orden',
    example: 'Pagada',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del estado',
    example: 'Orden pagada completamente',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'La descripción no puede exceder 200 caracteres' })
  descripcion?: string;
}
