import { IsDateString, IsOptional } from 'class-validator';

export class DisponibilidadDto {
  @IsDateString()
  desde!: string;

  @IsDateString()
  hasta!: string;

  @IsOptional()
  incluir_abiertas?: 'true' | 'false' = 'true'; // considera sesiones_mesa abiertas
}
