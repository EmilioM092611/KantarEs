// backend/src/productos/recetas/dto/linea-receta.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class LineaRecetaDto {
  @ApiProperty({
    description: 'ID del producto que es insumo en esta receta',
    example: 12,
  })
  @IsInt()
  @IsNotEmpty()
  id_insumo: number;

  @ApiProperty({
    description: 'Cantidad necesaria del insumo',
    example: 2.5,
  })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  cantidad_necesaria: number;

  @ApiProperty({
    description: 'ID de la unidad de medida',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  id_unidad_medida: number;

  @ApiProperty({
    description: 'Porcentaje de merma esperada (0-100)',
    example: 5,
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  merma_esperada_porcentaje?: number;

  @ApiProperty({
    description: 'Notas o instrucciones de preparación',
    example: 'Picar finamente antes de agregar',
    required: false,
  })
  @IsString()
  @IsOptional()
  notas_preparacion?: string;
}
