// ============== aplicar-propina.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class AplicarPropinaDto {
  @ApiProperty({
    example: 50,
    description: 'Monto de propina',
  })
  @IsNumber()
  @Min(0)
  propina: number;
}
