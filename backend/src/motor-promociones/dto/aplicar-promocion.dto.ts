import { ValidateIf, IsNumber, IsString } from 'class-validator';
export class AplicarPromocionDto {
  @ValidateIf((o) => !o.codigo) @IsNumber() id_promocion?: number;
  @ValidateIf((o) => !o.id_promocion) @IsString() codigo?: string;
}
