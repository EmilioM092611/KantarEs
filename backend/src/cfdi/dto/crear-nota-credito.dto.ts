// src/cfdi/dto/crear-nota-credito.dto.ts

import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConceptoNotaCreditoDto {
  @ApiProperty({
    description: 'Descripción del concepto',
    example: 'Devolución por producto defectuoso',
  })
  @IsString()
  descripcion: string;

  @ApiProperty({
    description: 'Cantidad',
    example: 1,
  })
  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @ApiProperty({
    description: 'Precio unitario',
    example: 150.00,
  })
  @IsNumber()
  @Min(0.01)
  precio_unitario: number;

  @ApiProperty({
    description: 'Importe total del concepto',
    example: 150.00,
  })
  @IsNumber()
  @Min(0.01)
  importe: number;

  @ApiPropertyOptional({
    description: 'Clave del producto o servicio del SAT',
    example: '01010101',
  })
  @IsOptional()
  @IsString()
  clave_prod_serv?: string;

  @ApiPropertyOptional({
    description: 'Clave de unidad del SAT',
    example: 'H87',
  })
  @IsOptional()
  @IsString()
  clave_unidad?: string;
}

export class CrearNotaCreditoDto {
  @ApiProperty({
    description: 'UUID del CFDI que se está relacionando (factura original)',
    example: '12345678-1234-1234-1234-123456789ABC',
  })
  @IsString()
  uuid_relacionado: string;

  @ApiProperty({
    description: 'Tipo de relación según catálogo SAT',
    example: '01',
    enum: ['01', '02', '03', '04', '05', '06', '07'],
  })
  @IsString()
  @IsIn(['01', '02', '03', '04', '05', '06', '07'])
  tipo_relacion: string;

  @ApiProperty({
    description: 'ID del receptor',
    example: 45,
  })
  @IsNumber()
  id_receptor: number;

  @ApiPropertyOptional({
    description: 'Serie de la nota de crédito',
    example: 'NC',
  })
  @IsOptional()
  @IsString()
  serie?: string;

  @ApiPropertyOptional({
    description: 'Folio de la nota de crédito',
    example: '001',
  })
  @IsOptional()
  @IsString()
  folio?: string;

  @ApiProperty({
    description: 'Motivo de la nota de crédito',
    example: 'Devolución de mercancía por defecto de fabricación',
  })
  @IsString()
  motivo: string;

  @ApiProperty({
    description: 'Conceptos de la nota de crédito',
    type: [ConceptoNotaCreditoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConceptoNotaCreditoDto)
  conceptos: ConceptoNotaCreditoDto[];

  @ApiProperty({
    description: 'Subtotal de la nota de crédito',
    example: 150.00,
  })
  @IsNumber()
  @Min(0.01)
  subtotal: number;

  @ApiProperty({
    description: 'Total de la nota de crédito',
    example: 174.00,
  })
  @IsNumber()
  @Min(0.01)
  total: number;
}

/**
 * Catálogo de tipos de relación según SAT
 */
export const TiposRelacionCFDI = {
  '01': 'Nota de crédito de los documentos relacionados',
  '02': 'Nota de débito de los documentos relacionados',
  '03': 'Devolución de mercancía sobre facturas o traslados previos',
  '04': 'Sustitución de los CFDI previos',
  '05': 'Traslados de mercancias facturados previamente',
  '06': 'Factura generada por los traslados previos',
  '07': 'CFDI por aplicación de anticipo',
};
