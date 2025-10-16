// backend/src/generos/dto/create-genero.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateGeneroDto {
  @ApiProperty({
    description: 'Nombre del género',
    example: 'Masculino',
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(30, { message: 'El nombre no puede exceder 30 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Abreviatura del género (1 carácter)',
    example: 'M',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 1, { message: 'La abreviatura debe ser de 1 carácter' })
  abreviatura?: string;
}
