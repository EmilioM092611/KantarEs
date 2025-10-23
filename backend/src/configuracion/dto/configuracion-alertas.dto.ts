// backend/src/configuracion/dto/configuracion-alertas.dto.ts

import { IsNumber, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AlertasInventarioDto {
  @ApiProperty({ example: 3 })
  @IsNumber()
  dias_antes_agotamiento: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  porcentaje_stock_minimo_alerta: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  notificar_productos_proximos_vencer: boolean;

  @ApiProperty({ example: 7 })
  @IsNumber()
  dias_antes_vencimiento: number;
}

class AlertasMesasDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  minutos_sin_atencion: number;

  @ApiProperty({ example: 80 })
  @IsNumber()
  porcentaje_ocupacion_alta: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  notificar_mesa_disponible: boolean;
}

class AlertasCocinaDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  minutos_tiempo_preparacion_excedido: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  notificar_orden_lista: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  notificar_orden_retrasada: boolean;
}

class AlertasReservacionesDto {
  @ApiProperty({ example: 15 })
  @IsNumber()
  minutos_antes_notificar: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  notificar_reservacion_proxima: boolean;
}

export class ConfiguracionAlertasDto {
  @ApiProperty({ type: AlertasInventarioDto })
  @ValidateNested()
  @Type(() => AlertasInventarioDto)
  inventario: AlertasInventarioDto;

  @ApiProperty({ type: AlertasMesasDto })
  @ValidateNested()
  @Type(() => AlertasMesasDto)
  mesas: AlertasMesasDto;

  @ApiProperty({ type: AlertasCocinaDto })
  @ValidateNested()
  @Type(() => AlertasCocinaDto)
  cocina: AlertasCocinaDto;

  @ApiProperty({ type: AlertasReservacionesDto })
  @ValidateNested()
  @Type(() => AlertasReservacionesDto)
  reservaciones: AlertasReservacionesDto;
}
