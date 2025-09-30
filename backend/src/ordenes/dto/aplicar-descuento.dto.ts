// ============== aplicar-descuento.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max, IsString } from 'class-validator';

export class AplicarDescuentoDto {
  @ApiProperty({
    example: 10,
    description: 'Descuento en porcentaje',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  descuento_porcentaje?: number;

  @ApiProperty({
    example: 50,
    description: 'Descuento en monto fijo',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento_monto?: number;

  @ApiProperty({
    example: 1,
    description: 'ID de promoción aplicada',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id_promocion_aplicada?: number;

  @ApiProperty({
    example: 'Descuento de gerencia',
    description: 'Motivo del descuento',
    required: false,
  })
  @IsOptional()
  @IsString()
  motivo_descuento?: string;
}
