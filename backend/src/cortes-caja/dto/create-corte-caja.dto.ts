// dto/create-corte-caja.dto.ts
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateCorteCajaDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de corte' })
  @IsInt()
  @Type(() => Number)
  id_tipo_corte: number;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario que realiza el corte',
  })
  @IsInt()
  @Type(() => Number)
  id_usuario_realiza: number;

  @ApiPropertyOptional({
    example: '500.00',
    description: 'Fondo inicial de caja',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  fondo_caja_inicial?: number | Decimal;

  @ApiPropertyOptional({ description: 'Observaciones del corte' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
