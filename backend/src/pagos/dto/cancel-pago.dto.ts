//cancel-pago.dto.ts
import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelPagoDto {
  @ApiProperty({
    example: 'Cliente solicitó cancelación',
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  motivo_cancelacion: string;
}
