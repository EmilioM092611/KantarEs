//adjust-inventario.dto.ts
import { IsInt, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class AdjustInventarioDto {
  @ApiProperty({
    example: '50.0000',
    description: 'Nueva cantidad de stock (reemplaza el actual)',
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  nuevo_stock: number | Decimal;

  @ApiProperty({
    example: 'Ajuste por inventario físico',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  motivo: string;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario que realiza el ajuste',
  })
  @IsInt()
  @Type(() => Number)
  id_usuario: number;
}
