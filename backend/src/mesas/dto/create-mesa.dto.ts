// ============== create-mesa.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateMesaDto {
  @ApiProperty({ example: 'A1', description: 'Número o código de la mesa' })
  @IsString()
  @MaxLength(10)
  numero_mesa: string;

  @ApiProperty({ example: 4, description: 'Capacidad de personas' })
  @IsNumber()
  @Min(1)
  @Max(20)
  capacidad_personas: number;

  @ApiProperty({
    example: 'Terraza',
    description: 'Ubicación de la mesa',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ubicacion?: string;

  @ApiProperty({
    example: 1,
    description: 'Planta o piso',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  planta?: number;

  @ApiProperty({
    example: 10,
    description: 'Coordenada X para mapa',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  coordenada_x?: number;

  @ApiProperty({
    example: 20,
    description: 'Coordenada Y para mapa',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  coordenada_y?: number;

  @ApiProperty({
    example: true,
    description: 'Mesa activa',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
