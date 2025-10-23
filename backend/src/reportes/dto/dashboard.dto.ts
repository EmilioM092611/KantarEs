import { ApiProperty } from '@nestjs/swagger';

export class DashboardKPIsDto {
  @ApiProperty({ example: 25430.5 })
  ventas_hoy: number;

  @ApiProperty({ example: 18.5 })
  variacion_vs_ayer: number;

  @ApiProperty({ example: 87 })
  ordenes_hoy: number;

  @ApiProperty({ example: 292.3 })
  ticket_promedio: number;

  @ApiProperty({ example: 12 })
  mesas_ocupadas: number;

  @ApiProperty({ example: 30 })
  mesas_totales: number;

  @ApiProperty({ example: 40.0 })
  porcentaje_ocupacion: number;

  @ApiProperty({ example: 5 })
  productos_stock_critico: number;

  @ApiProperty({ example: 3250.8 })
  propinas_totales: number;

  @ApiProperty({ example: 156000.0 })
  ventas_mes_actual: number;

  @ApiProperty({ example: 12.3 })
  variacion_vs_mes_anterior: number;
}

export class TendenciaVentasDto {
  @ApiProperty({ example: '2025-10-15' })
  fecha: string;

  @ApiProperty({ example: 15430.5 })
  total_ventas: number;

  @ApiProperty({ example: 52 })
  total_ordenes: number;

  @ApiProperty({ example: 296.74 })
  ticket_promedio: number;
}

export class ProductoTopDto {
  @ApiProperty({ example: 1 })
  id_producto: number;

  @ApiProperty({ example: 'Hamburguesa Especial' })
  nombre: string;

  @ApiProperty({ example: 145 })
  cantidad_vendida: number;

  @ApiProperty({ example: 18705.0 })
  ingresos_totales: number;

  @ApiProperty({ example: 'Comida' })
  categoria: string;
}

export class DashboardResponseDto {
  @ApiProperty({ type: DashboardKPIsDto })
  kpis: DashboardKPIsDto;

  @ApiProperty({ type: [TendenciaVentasDto] })
  tendencia_7_dias: TendenciaVentasDto[];

  @ApiProperty({ type: [ProductoTopDto] })
  productos_top_5: ProductoTopDto[];

  @ApiProperty()
  horas_pico: any[];

  @ApiProperty()
  alertas: any[];
}
