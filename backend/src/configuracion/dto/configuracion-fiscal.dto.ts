import {
  IsNumber,
  IsBoolean,
  IsString,
  IsArray,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfiguracionFiscalDto {
  @ApiProperty({ example: 16, description: 'Tasa de IVA por defecto' })
  @IsNumber()
  @Min(0)
  @Max(100)
  iva_tasa_default: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  ieps_aplicable: boolean;

  @ApiProperty({ example: 8 })
  @IsNumber()
  @Min(0)
  @Max(100)
  ieps_tasa_default: number;

  @ApiProperty({
    example: [10, 15, 20],
    description: 'Porcentajes de propina sugeridos',
  })
  @IsArray()
  propina_sugerida_porcentaje: number[];

  @ApiProperty({ example: false })
  @IsBoolean()
  propina_obligatoria: boolean;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  propina_tasa_obligatoria?: number;

  @ApiProperty({ example: '601 - General de Ley Personas Morales' })
  @IsString()
  regimen_fiscal: string;

  @ApiProperty({ example: '06000' })
  @IsString()
  lugar_expedicion: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  incluir_propina_en_factura: boolean;
}
