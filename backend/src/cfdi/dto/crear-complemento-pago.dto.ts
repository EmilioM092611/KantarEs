// src/cfdi/dto/crear-complemento-pago.dto.ts

import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
  IsIn,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentoRelacionadoDto {
  @ApiProperty({
    description: 'UUID del CFDI que se está pagando',
    example: '12345678-1234-1234-1234-123456789ABC',
  })
  @IsString()
  id_documento: string;

  @ApiProperty({
    description: 'Serie del documento',
    example: 'A',
  })
  @IsString()
  serie: string;

  @ApiProperty({
    description: 'Folio del documento',
    example: '123',
  })
  @IsString()
  folio: string;

  @ApiProperty({
    description: 'Moneda del documento relacionado',
    example: 'MXN',
  })
  @IsString()
  moneda_dr: string;

  @ApiProperty({
    description: 'Número de parcialidad',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  num_parcialidad: number;

  @ApiProperty({
    description: 'Importe del saldo anterior',
    example: 1000.00,
  })
  @IsNumber()
  @Min(0)
  imp_saldo_ant: number;

  @ApiProperty({
    description: 'Importe pagado',
    example: 500.00,
  })
  @IsNumber()
  @Min(0.01)
  imp_pagado: number;

  @ApiProperty({
    description: 'Importe del saldo insoluto',
    example: 500.00,
  })
  @IsNumber()
  @Min(0)
  imp_saldo_insoluto: number;
}

export class PagoDto {
  @ApiProperty({
    description: 'Fecha y hora del pago',
    example: '2025-10-21T14:30:00',
  })
  @IsDateString()
  fecha_pago: string;

  @ApiProperty({
    description: 'Forma de pago según catálogo SAT',
    example: '01',
    enum: ['01', '02', '03', '04', '28', '99'],
  })
  @IsString()
  @IsIn(['01', '02', '03', '04', '05', '06', '28', '29', '99'])
  forma_pago_p: string;

  @ApiProperty({
    description: 'Moneda del pago',
    example: 'MXN',
  })
  @IsString()
  moneda_p: string;

  @ApiProperty({
    description: 'Monto del pago',
    example: 500.00,
  })
  @IsNumber()
  @Min(0.01)
  monto: number;

  @ApiPropertyOptional({
    description: 'Número de operación (referencia bancaria)',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  num_operacion?: string;

  @ApiPropertyOptional({
    description: 'RFC del banco emisor',
    example: 'BXXX010101XXX',
  })
  @IsOptional()
  @IsString()
  rfc_emisor_cta_ben?: string;

  @ApiPropertyOptional({
    description: 'Cuenta beneficiaria (últimos 4 dígitos)',
    example: '1234',
  })
  @IsOptional()
  @IsString()
  cta_beneficiario?: string;

  @ApiProperty({
    description: 'Documentos relacionados que se están pagando',
    type: [DocumentoRelacionadoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentoRelacionadoDto)
  documentos_relacionados: DocumentoRelacionadoDto[];
}

export class CrearComplementoPagoDto {
  @ApiProperty({
    description: 'ID del receptor (cliente que realiza el pago)',
    example: 45,
  })
  @IsNumber()
  id_receptor: number;

  @ApiPropertyOptional({
    description: 'Serie del complemento de pago',
    example: 'P',
  })
  @IsOptional()
  @IsString()
  serie?: string;

  @ApiPropertyOptional({
    description: 'Folio del complemento de pago',
    example: '001',
  })
  @IsOptional()
  @IsString()
  folio?: string;

  @ApiProperty({
    description: 'Información del pago',
    type: PagoDto,
  })
  @ValidateNested()
  @Type(() => PagoDto)
  pago: PagoDto;
}

/**
 * Catálogo de formas de pago según SAT
 */
export const FormasPagoSAT = {
  '01': 'Efectivo',
  '02': 'Cheque nominativo',
  '03': 'Transferencia electrónica de fondos',
  '04': 'Tarjeta de crédito',
  '05': 'Monedero electrónico',
  '06': 'Dinero electrónico',
  '28': 'Tarjeta de débito',
  '29': 'Tarjeta de servicios',
  '99': 'Por definir',
};
