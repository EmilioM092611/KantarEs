// ============== transferir-mesa.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TransferirMesaDto {
  @ApiProperty({
    example: 5,
    description: 'ID de la mesa destino',
  })
  @IsNumber()
  id_mesa_destino: number;
}
