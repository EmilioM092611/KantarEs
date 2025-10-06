import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
class DVItem {
  @IsNumber() id_detalle!: number;
  @IsNumber() cantidad!: number;
  @IsOptional() @IsString() motivo?: string;
}
export class DevolucionVentaDto {
  @IsNumber() id_orden!: number;
  @IsNumber() id_usuario!: number;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DVItem)
  items!: DVItem[];
}
