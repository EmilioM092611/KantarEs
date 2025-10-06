import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateReservacionDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  id_mesa?: number;

  @IsNotEmpty()
  nombre_cliente!: string;

  @IsOptional()
  @IsPhoneNumber('MX')
  telefono?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  personas?: number = 1;

  @IsDateString()
  fecha_inicio!: string; // ISO

  @IsDateString()
  fecha_fin!: string; // ISO

  @IsOptional()
  notas?: string;
}
