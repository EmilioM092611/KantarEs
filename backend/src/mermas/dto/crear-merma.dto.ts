import { IsNumber, IsOptional, IsString } from 'class-validator';
export class CrearMermaDto {
  @IsNumber() id_producto!: number;
  @IsNumber() cantidad!: number;
  @IsNumber() id_usuario!: number;
  @IsOptional() @IsString() motivo?: string;
}
