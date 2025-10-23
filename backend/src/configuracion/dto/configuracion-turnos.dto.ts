// backend/src/configuracion/dto/configuracion-turnos.dto.ts

import { IsString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TurnoDto {
  @ApiProperty({ example: 'Matutino' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  hora_inicio: string;

  @ApiProperty({ example: '15:00' })
  @IsString()
  hora_fin: string;

  @ApiProperty({
    example: [1, 2, 3, 4, 5],
    description: '0=Domingo, 1=Lunes...',
  })
  @IsArray()
  dias_semana: number[];

  @ApiProperty({ example: true })
  @IsBoolean()
  requiere_corte: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  activo: boolean;
}

export class ConfiguracionTurnosDto {
  @ApiProperty({ type: [TurnoDto] })
  @ValidateNested({ each: true })
  @Type(() => TurnoDto)
  @IsArray()
  turnos: TurnoDto[];

  @ApiProperty({ example: false })
  @IsBoolean()
  permitir_traslape_turnos: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  requiere_corte_entre_turnos: boolean;
}
