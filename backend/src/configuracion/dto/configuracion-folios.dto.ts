// backend/src/configuracion/dto/configuracion-folios.dto.ts

import {
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfiguracionFoliosDto {
  @ApiProperty({ example: 'ORD' })
  @IsString()
  @Length(1, 10)
  prefijo_orden: string;

  @ApiProperty({ example: 'PAY' })
  @IsString()
  @Length(1, 10)
  prefijo_pago: string;

  @ApiProperty({ example: 'CORTE' })
  @IsString()
  @Length(1, 10)
  prefijo_corte: string;

  @ApiProperty({ example: 'COMP' })
  @IsString()
  @Length(1, 10)
  prefijo_compra: string;

  @ApiProperty({ example: 'FACT' })
  @IsString()
  @Length(1, 10)
  prefijo_factura: string;

  @ApiProperty({ example: 6, description: 'Longitud del consecutivo numérico' })
  @IsNumber()
  @Min(4)
  @Max(10)
  longitud_consecutivo: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  reiniciar_diario: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  reiniciar_mensual: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  reiniciar_anual: boolean;
}
