import { IsInt, IsPositive } from 'class-validator';

export class AsignarMesaDto {
  @IsInt()
  @IsPositive()
  id_mesa!: number;
}
