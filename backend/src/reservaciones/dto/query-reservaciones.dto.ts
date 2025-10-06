import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class QueryReservacionesDto {
  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;

  @IsOptional()
  @IsIn(['pendiente', 'confirmada', 'cancelada', 'no_show', 'cumplida'])
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'no_show' | 'cumplida';

  @IsOptional()
  @IsInt()
  @IsPositive()
  id_mesa?: number;
}
