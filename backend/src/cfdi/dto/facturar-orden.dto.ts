//facturar-orden.dto.ts
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
export class FacturarOrdenDto {
  @IsInt() id_receptor!: number;
  @IsOptional() @IsString() serie?: string;
  @IsOptional() @IsString() folio?: string;
  @IsOptional() @IsIn(['I', 'P', 'E']) tipo?: 'I' | 'P' | 'E';
  @IsOptional() @IsString() xml?: string; // <- si envías XML al PAC real
}
