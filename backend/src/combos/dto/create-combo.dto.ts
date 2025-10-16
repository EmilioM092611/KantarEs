// backend/src/productos/combos/dto/create-combo.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { ComponenteComboDto } from './componente-combo.dto';

export class CreateComboDto {
  @ApiProperty({
    description: 'Lista de componentes que conforman el combo',
    type: [ComponenteComboDto],
    example: [
      {
        id_producto_componente: 5,
        cantidad: 1,
        es_opcional: false,
        precio_adicional: 0,
        orden_visualizacion: 1,
      },
      {
        id_producto_componente: 8,
        cantidad: 2,
        es_opcional: true,
        precio_adicional: 5.0,
        grupo_opciones: 'Bebidas',
        orden_visualizacion: 2,
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'El combo debe tener al menos un componente' })
  @ValidateNested({ each: true })
  @Type(() => ComponenteComboDto)
  componentes: ComponenteComboDto[];
}
