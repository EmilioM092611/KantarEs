// ============== add-item.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class AddItemDto {
  @ApiProperty({ example: 1, description: 'ID del producto' })
  @IsNumber()
  id_producto: number;

  @ApiProperty({ example: 2, description: 'Cantidad' })
  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @ApiProperty({
    example: 'Sin cebolla',
    description: 'Notas especiales',
    required: false,
  })
  @IsOptional()
  @IsString()
  notas_especiales?: string;

  @ApiProperty({
    example: 100.5,
    description: 'Precio unitario (opcional, se toma del producto)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  precio_unitario?: number;

  @ApiProperty({
    example: 10,
    description: 'Descuento porcentaje',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento_porcentaje?: number;

  @ApiProperty({
    example: 0,
    description: 'Descuento monto',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento_monto?: number;
}
