import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AgregarInsumoDto {
  @ApiProperty({
    description: 'ID del insumo a agregar',
    example: 20,
  })
  @IsInt()
  @Min(1)
  id_insumo: number;

  @ApiProperty({
    description: 'Cantidad necesaria',
    example: 0.25,
  })
  @IsNumber()
  @Min(0.0001)
  cantidad_necesaria: number;

  @ApiProperty({
    description: 'ID de la unidad de medida',
    example: 3,
  })
  @IsInt()
  @Min(1)
  id_unidad_medida: number;

  @ApiProperty({
    description: 'Porcentaje de merma esperada',
    example: 3.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  merma_esperada_porcentaje?: number;

  @ApiProperty({
    description: 'Notas de preparación',
    required: false,
  })
  @IsOptional()
  @IsString()
  notas_preparacion?: string;
}
