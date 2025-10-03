//cancel-compra.dto.ts
import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelCompraDto {
  @ApiProperty({
    example: 'Proveedor no puede surtir el pedido',
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  observaciones: string;
}
