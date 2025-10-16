// backend/src/productos/combos/dto/componente-combo.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class ComponenteComboDto {
  @ApiProperty({
    description: 'ID del producto que será componente del combo',
    example: 5,
  })
  @IsInt()
  @IsNotEmpty()
  id_producto_componente: number;

  @ApiProperty({
    description: 'Cantidad del componente en el combo',
    example: 2,
    default: 1,
  })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  cantidad: number;

  @ApiProperty({
    description: 'Indica si el componente es opcional',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  es_opcional?: boolean;

  @ApiProperty({
    description: 'Precio adicional por este componente (si aplica)',
    example: 0,
    required: false,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  precio_adicional?: number;

  @ApiProperty({
    description:
      'Grupo de opciones al que pertenece (para componentes opcionales)',
    example: 'Bebidas',
    required: false,
  })
  @IsString()
  @IsOptional()
  grupo_opciones?: string;

  @ApiProperty({
    description: 'Orden de visualización del componente',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  orden_visualizacion?: number;
}
