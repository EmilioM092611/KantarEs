// backend/src/tipos-producto/dto/update-tipo-producto.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
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

export class UpdateTipoProductoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nombre?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requiere_preparacion?: boolean;

  @ApiProperty({ enum: AreaPreparacion, required: false })
  @IsOptional()
  @IsEnum(AreaPreparacion)
  area_preparacion?: AreaPreparacion;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  orden_menu?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icono?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

// =====================================================
// backend/src/tipos-producto/dto/query-tipos-producto.dto.ts
import { Transform } from 'class-transformer';

export class QueryTiposProductoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activo?: boolean;

  @ApiProperty({ enum: AreaPreparacion, required: false })
  @IsOptional()
  @IsEnum(AreaPreparacion)
  area_preparacion?: string;
}
