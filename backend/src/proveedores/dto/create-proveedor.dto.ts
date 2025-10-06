import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProveedorDto {
  @ApiProperty({
    description: 'Razón social del proveedor',
    example: 'Distribuidora XYZ S.A. de C.V.',
    maxLength: 150,
  })
  @IsString()
  @MaxLength(150)
  razon_social: string;

  @ApiPropertyOptional({
    description: 'Nombre comercial del proveedor',
    example: 'Distribuidora XYZ',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre_comercial?: string;

  @ApiProperty({
    description: 'RFC del proveedor (formato mexicano)',
    example: 'DIS123456ABC',
    maxLength: 13,
    pattern: '^[A-Z&Ñ]{3,4}\\d{6}[A-Z0-9]{3}$',
  })
  @IsString()
  @MaxLength(13)
  @Matches(/^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/, {
    message: 'RFC debe tener formato válido (ej: ABC123456XYZ)',
  })
  rfc: string;

  @ApiPropertyOptional({
    description: 'Dirección completa del proveedor',
    example: 'Av. Principal 123, Col. Centro',
  })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Ciudad',
    example: 'Querétaro',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @ApiPropertyOptional({
    description: 'Estado',
    example: 'Querétaro',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  estado?: string;

  @ApiPropertyOptional({
    description: 'Código postal (5 dígitos)',
    example: '76000',
    maxLength: 10,
    pattern: '^\\d{5}$',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Matches(/^\d{5}$/, {
    message: 'Código postal debe tener 5 dígitos',
  })
  codigo_postal?: string;

  @ApiPropertyOptional({
    description: 'Teléfono (10 dígitos)',
    example: '4421234567',
    maxLength: 15,
    pattern: '^\\d{10}$',
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  @Matches(/^\d{10}$/, {
    message: 'Teléfono debe tener 10 dígitos',
  })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto',
    example: 'ventas@distribuidora.com',
    maxLength: 100,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({
    description: 'Nombre del contacto principal',
    example: 'Juan Pérez',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contacto_nombre?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del contacto (10 dígitos)',
    example: '4429876543',
    maxLength: 15,
    pattern: '^\\d{10}$',
  })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  @Matches(/^\d{10}$/, {
    message: 'Teléfono de contacto debe tener 10 dígitos',
  })
  contacto_telefono?: string;

  @ApiPropertyOptional({
    description: 'Días de crédito otorgados',
    example: 30,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  dias_credito?: number = 0;

  @ApiPropertyOptional({
    description: 'Límite de crédito en pesos',
    example: 50000,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  limite_credito?: number = 0;

  @ApiPropertyOptional({
    description: 'Número de cuenta bancaria',
    example: '012345678901234567',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cuenta_bancaria?: string;

  @ApiPropertyOptional({
    description: 'Nombre del banco',
    example: 'BBVA Bancomer',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  banco?: string;

  @ApiPropertyOptional({
    description: 'Calificación del proveedor (1-10)',
    example: 5,
    minimum: 1,
    maximum: 10,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  calificacion?: number = 5;

  @ApiPropertyOptional({
    description: 'Indica si el proveedor está activo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}
