import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';

export enum AreaPreparacion {
  COCINA = 'cocina',
  BARRA = 'barra',
  NINGUNA = 'ninguna',
}

export class CreateCategoriaDto {
  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  requiere_preparacion?: boolean = false;

  @IsOptional()
  @IsEnum(AreaPreparacion)
  area_preparacion?: AreaPreparacion = AreaPreparacion.NINGUNA;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden_menu?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icono?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}
