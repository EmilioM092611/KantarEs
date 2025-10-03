// dto/close-corte-caja.dto.ts
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class CloseCorteCajaDto {
  @ApiProperty({
    example: 1,
    description: 'ID del usuario que autoriza el cierre',
  })
  @IsInt()
  @Type(() => Number)
  id_usuario_autoriza: number;

  @ApiProperty({
    example: '5000.00',
    description: 'Efectivo contado físicamente',
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  efectivo_contado: number | Decimal;

  @ApiPropertyOptional({
    example: '500.00',
    description: 'Fondo de caja final para el siguiente corte',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  fondo_caja_final?: number | Decimal;

  @ApiPropertyOptional({
    example: '200.00',
    description: 'Retiros de efectivo realizados',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  retiros_efectivo?: number | Decimal;

  @ApiPropertyOptional({
    example: '50.00',
    description: 'Gastos pagados desde la caja',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  gastos_caja?: number | Decimal;

  @ApiPropertyOptional({ description: 'Observaciones del cierre' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
