import { IsIn, IsOptional } from 'class-validator';

export class EstadoReservacionDto {
  @IsIn(['confirmada', 'cancelada', 'no_show', 'cumplida'])
  estado!: 'confirmada' | 'cancelada' | 'no_show' | 'cumplida';

  @IsOptional()
  notas?: string;
}
