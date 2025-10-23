import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InsumoRecetaDto {
  @ApiProperty({
    description: 'ID del insumo (debe ser un producto con es_insumo=true)',
    example: 15,
  })
  @IsInt()
  @Min(1)
  id_insumo: number;

  @ApiProperty({
    description: 'Cantidad necesaria del insumo',
    example: 0.5,
  })
  @IsNumber()
  @Min(0.0001)
  cantidad_necesaria: number;

  @ApiProperty({
    description: 'ID de la unidad de medida',
    example: 2,
  })
  @IsInt()
  @Min(1)
  id_unidad_medida: number;

  @ApiProperty({
    description: 'Porcentaje de merma esperada (0-100)',
    example: 5.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  merma_esperada_porcentaje?: number;

  @ApiProperty({
    description: 'Notas de preparación del insumo',
    example: 'Cortar en cubos de 2cm',
    required: false,
  })
  @IsOptional()
  @IsString()
  notas_preparacion?: string;
}

export class CrearRecetaDto {
  @ApiProperty({
    description: 'ID del producto final (debe tener es_inventariable=true)',
    example: 25,
  })
  @IsInt()
  @Min(1)
  id_producto_final: number;

  @ApiProperty({
    description: 'Lista de insumos necesarios para la receta',
    type: [InsumoRecetaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InsumoRecetaDto)
  insumos: InsumoRecetaDto[];

  @ApiProperty({
    description: 'Notas generales de la receta',
    example: 'Preparar en orden: base, relleno, decoración',
    required: false,
  })
  @IsOptional()
  @IsString()
  notas_receta?: string;
}
