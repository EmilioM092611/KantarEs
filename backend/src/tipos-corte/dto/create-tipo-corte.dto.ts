//create-tipo-corte.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTipoCorteDto {
  @ApiProperty({ example: 'Corte Parcial', maxLength: 30 })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  nombre: string;

  @ApiPropertyOptional({
    example: 'Corte de caja al final del turno',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  descripcion?: string;

  @ApiPropertyOptional({
    example: false,
    description:
      'Si se reinician los consecutivos al realizar este tipo de corte',
  })
  @IsOptional()
  @IsBoolean()
  reinicia_consecutivos?: boolean;
}
