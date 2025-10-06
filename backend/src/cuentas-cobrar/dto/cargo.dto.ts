import { IsNumber, IsOptional, IsString } from 'class-validator';
export class CargoDto {
  @IsNumber() monto!: number;
  @IsOptional() @IsString() referencia?: string;
  @IsOptional() id_orden?: number;
}
