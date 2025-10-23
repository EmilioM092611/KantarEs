// backend/src/impresion/dto/imprimir.dto.ts

import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumento } from '../interfaces/impresion.interface';

export class ImprimirComandaDto {
  @ApiProperty({ example: 123 })
  @IsNumber()
  id_orden: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  id_impresora?: number;
}

export class ImprimirTicketDto {
  @ApiProperty({ example: 123 })
  @IsNumber()
  id_orden: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  id_impresora?: number;
}

export class ImprimirCorteDto {
  @ApiProperty({ example: 45 })
  @IsNumber()
  id_corte: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  id_impresora?: number;
}
