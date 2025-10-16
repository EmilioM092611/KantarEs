// backend/src/productos/recetas/dto/create-receta.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { LineaRecetaDto } from './linea-receta.dto';

export class CreateRecetaDto {
  @ApiProperty({
    description: 'Lista de líneas de receta (insumos necesarios)',
    type: [LineaRecetaDto],
    example: [
      {
        id_insumo: 12,
        cantidad_necesaria: 2.5,
        id_unidad_medida: 1,
        merma_esperada_porcentaje: 5,
        notas_preparacion: 'Picar finamente',
      },
      {
        id_insumo: 15,
        cantidad_necesaria: 0.5,
        id_unidad_medida: 2,
        merma_esperada_porcentaje: 0,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'La receta debe tener al menos una línea' })
  @ValidateNested({ each: true })
  @Type(() => LineaRecetaDto)
  lineas: LineaRecetaDto[];
}
