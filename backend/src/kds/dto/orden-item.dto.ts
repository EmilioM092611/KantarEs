// backend/src/kds/dto/orden-item.dto.ts

import { IsEnum, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoItemKDS } from '../interfaces/kds.interface';

export class CambiarEstadoItemDto {
  @ApiProperty({ enum: EstadoItemKDS, example: EstadoItemKDS.PREPARANDO })
  @IsEnum(EstadoItemKDS)
  estado: EstadoItemKDS;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  id_usuario_prepara?: number;
}

export class CambiarPrioridadDto {
  @ApiProperty({ example: 5, description: 'Mayor número = mayor prioridad' })
  @IsNumber()
  @Min(0)
  prioridad: number;
}

export class MarcarAtencionDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  requiere_atencion: boolean;
}

export class ActualizarPosicionDto {
  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(1)
  posicion_pantalla: number;
}
