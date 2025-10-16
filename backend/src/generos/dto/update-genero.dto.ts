// backend/src/generos/dto/update-genero.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  Length,
  IsBoolean,
} from 'class-validator';

export class UpdateGeneroDto {
  @ApiProperty({
    description: 'Nombre del género',
    example: 'Femenino',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nombre?: string;

  @ApiProperty({
    description: 'Abreviatura del género',
    example: 'F',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  abreviatura?: string;

  @ApiProperty({
    description: 'Estado activo/inactivo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
