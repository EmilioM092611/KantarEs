import {
  IsString,
  IsEnum,
  IsNumber,
  MaxLength,
  IsOptional,
  Min,
} from 'class-validator';

export enum TipoUnidad {
  PESO = 'peso',
  VOLUMEN = 'volumen',
  UNIDAD = 'unidad',
}

export class CreateUnidadDto {
  @IsString()
  @MaxLength(30)
  nombre: string;

  @IsString()
  @MaxLength(10)
  abreviatura: string;

  @IsEnum(TipoUnidad)
  tipo: TipoUnidad;

  @IsOptional()
  @IsNumber()
  @Min(0)
  factor_conversion?: number = 1.0;
}
