//recepcionar-compra.dto.ts
import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  MaxLength,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecepcionarItemDto {
  @ApiProperty()
  @IsInt()
  id_detalle: number;

  @ApiProperty()
  cantidad_recibida: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fecha_caducidad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones_item?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estado_mercancia?: 'excelente' | 'bueno' | 'aceptable' | 'defectuoso';
}
export class RecepcionarCompraDto {
  @ApiProperty({ example: 1, description: 'ID del usuario que autoriza' })
  @IsInt()
  @Type(() => Number)
  id_usuario_autoriza: number;

  @ApiProperty({ example: '2024-10-03', description: 'Fecha de recepción' })
  @IsDateString()
  fecha_recepcion: string;

  @ApiPropertyOptional({ example: 'FAC-2024-001', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numero_factura?: string;

  @ApiProperty({
    type: [RecepcionarItemDto],
    description: 'Items recibidos con cantidades',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecepcionarItemDto)
  items: RecepcionarItemDto[];

  @ApiPropertyOptional({ example: 'Mercancía en buen estado' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre_quien_recibe?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotos_recepcion?: string[]; // URLs de fotos

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  recepcion_completa?: boolean;
}
