// backend/src/tipos-producto/dto/create-tipo-producto.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

enum AreaPreparacion {
  COCINA = 'cocina',
  BARRA = 'barra',
  NINGUNA = 'ninguna',
}

export class CreateTipoProductoDto {
  @ApiProperty({
    description: 'Nombre del tipo de producto',
    example: 'Bebidas Calientes',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre: string;

  @ApiProperty({
    description: 'Descripción del tipo',
    example: 'Café, té, chocolate caliente',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;

  @ApiProperty({
    description: 'Requiere preparación en cocina/barra',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  requiere_preparacion?: boolean;

  @ApiProperty({
    description: 'Área de preparación',
    enum: AreaPreparacion,
    example: AreaPreparacion.BARRA,
    required: false,
  })
  @IsOptional()
  @IsEnum(AreaPreparacion)
  area_preparacion?: AreaPreparacion;

  @ApiProperty({
    description: 'Orden de visualización en menú',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  orden_menu?: number;

  @ApiProperty({
    description: 'Icono representativo',
    example: 'coffee',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icono?: string;
}
