//cancel-corte-caja.dto.ts
import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelCorteCajaDto {
  @ApiProperty({
    example: 'Error en el conteo, se requiere realizar nuevo corte',
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  observaciones: string;
}
