//create-pago.dto.ts
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
  Min,
  ValidateIf,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { tipo_tarjeta } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class CreatePagoDto {
  @ApiProperty({ example: 1, description: 'ID de la orden' })
  @IsInt()
  @Type(() => Number)
  id_orden: number;

  @ApiProperty({ example: 1, description: 'ID del método de pago' })
  @IsInt()
  @Type(() => Number)
  id_metodo_pago: number;

  @ApiProperty({ example: 1, description: 'ID del usuario que cobra' })
  @IsInt()
  @Type(() => Number)
  id_usuario_cobra: number;

  @ApiProperty({ example: '500.00', description: 'Monto del pago' })
  @IsNumber()
  @Type(() => Number)
  @Min(0.01)
  monto: number | Decimal;

  @ApiPropertyOptional({ example: 'TRX123456', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referencia_transaccion?: string;

  @ApiPropertyOptional({ example: 'AUTH789', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numero_autorizacion?: string;

  // Campos específicos para tarjeta
  @ApiPropertyOptional({ example: '4242', maxLength: 4 })
  @ValidateIf((o) => o.tipo_tarjeta !== undefined)
  @IsString()
  @MaxLength(4)
  @Matches(/^\d{4}$/, { message: 'Deben ser 4 dígitos' })
  ultimos_4_digitos?: string;

  @ApiPropertyOptional({ example: 'JUAN PEREZ', maxLength: 100 })
  @ValidateIf((o) => o.tipo_tarjeta !== undefined)
  @IsString()
  @MaxLength(100)
  nombre_tarjetahabiente?: string;

  @ApiPropertyOptional({ enum: tipo_tarjeta, example: 'credito' })
  @IsOptional()
  @IsEnum(tipo_tarjeta)
  tipo_tarjeta?: tipo_tarjeta;

  @ApiPropertyOptional({ example: 'BBVA', maxLength: 50 })
  @ValidateIf((o) => o.tipo_tarjeta !== undefined)
  @IsString()
  @MaxLength(50)
  banco_emisor?: string;

  // Campo para efectivo
  @ApiPropertyOptional({
    example: '50.00',
    description: 'Cambio entregado al cliente',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  cambio_entregado?: number | Decimal;
}
