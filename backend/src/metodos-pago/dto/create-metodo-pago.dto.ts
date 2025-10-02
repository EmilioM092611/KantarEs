//create-metodo-pago.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDecimal,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateMetodoPagoDto {
  @ApiProperty({ example: 'Efectivo', maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nombre: string;

  @ApiPropertyOptional({
    example: 'Pago en efectivo al momento de la entrega',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  descripcion?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  requiere_referencia?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  requiere_autorizacion?: boolean;

  @ApiPropertyOptional({
    example: '0.00',
    description: 'Comisión en porcentaje (0-100)',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  comision_porcentaje?: number | Decimal;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({ example: 'credit-card', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icono?: string;
}
