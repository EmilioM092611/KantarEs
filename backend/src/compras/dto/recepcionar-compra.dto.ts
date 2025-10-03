//recepcionar-compra.dto.ts
import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecepcionarItemDto {
  @ApiProperty({ example: 1, description: 'ID del detalle de compra' })
  @IsInt()
  @Type(() => Number)
  id_detalle: number;

  @ApiProperty({ example: '100.0000', description: 'Cantidad recibida' })
  @Type(() => Number)
  cantidad_recibida: number;
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
}
