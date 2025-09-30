// ============== create-orden.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrdenItemDto {
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
    description: 'Precio unitario (se toma del producto si no se especifica)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  precio_unitario?: number;

  @ApiProperty({
    example: 10,
    description: 'Descuento en porcentaje',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento_porcentaje?: number;

  @ApiProperty({
    example: 0,
    description: 'Descuento en monto',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento_monto?: number;
}

export class CreateOrdenDto {
  @ApiProperty({ example: 1, description: 'ID de la sesión de mesa' })
  @IsNumber()
  id_sesion_mesa: number;

  @ApiProperty({
    example: 'Cliente pidió poco picante',
    description: 'Observaciones generales',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({
    example: false,
    description: 'Orden para llevar',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  para_llevar?: boolean;

  @ApiProperty({
    type: [CreateOrdenItemDto],
    description: 'Items de la orden',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrdenItemDto)
  items?: CreateOrdenItemDto[];
}
