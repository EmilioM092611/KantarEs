import { IsNumber, IsOptional, IsString } from 'class-validator';
export class AbonoDto {
  @IsNumber() monto!: number;
  @IsOptional() @IsString() referencia?: string;
  @IsOptional() id_pago?: number;
}
