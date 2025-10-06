import { IsIn, IsOptional } from 'class-validator';
export class CambiarEstadoItemDto {
  @IsOptional()
  @IsIn(['pendiente', 'en_preparacion', 'listo'])
  estado?: 'pendiente' | 'en_preparacion' | 'listo';
}
