/* eslint-disable @typescript-eslint/no-unsafe-argument */
// ============== estadisticas-cocina.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsDate } from 'class-validator';

export class EstadisticasCocinaDto {
  @ApiProperty({ required: false, description: 'Fecha desde', default: 'hoy' })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : new Date()))
  @IsDate()
  fecha_desde?: Date;

  @ApiProperty({
    required: false,
    description: 'Fecha hasta',
    default: 'ahora',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : new Date()))
  @IsDate()
  fecha_hasta?: Date;
}
