// backend/src/compras/dto/sugerencias-compras.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SugerenciasComprasDto {
  @ApiProperty({
    description: 'Días de inventario proyectado',
    example: 7,
    default: 7,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  dias_proyeccion?: number;

  @ApiProperty({
    description: 'Incluir solo productos críticos',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  solo_criticos?: boolean;
}

export class SugerenciaCompraItemDto {
  @ApiProperty({ example: 1 })
  id_producto: number;

  @ApiProperty({ example: 'BEB-001' })
  sku: string;

  @ApiProperty({ example: 'Coca Cola 600ml' })
  nombre: string;

  @ApiProperty({ example: 12.5 })
  stock_actual: number;

  @ApiProperty({ example: 20.0 })
  stock_minimo: number;

  @ApiProperty({ example: 50.0 })
  punto_reorden: number;

  @ApiProperty({ example: 8.33 })
  consumo_promedio_diario: number;

  @ApiProperty({ example: 1.5 })
  dias_restantes: number;

  @ApiProperty({ example: 58.31 })
  cantidad_sugerida: number;

  @ApiProperty({ example: 'Pza' })
  unidad_medida: string;

  @ApiProperty({ example: 'CRÍTICO' })
  prioridad: string;

  @ApiProperty({ example: 25.0 })
  costo_unitario: number;

  @ApiProperty({ example: 1457.75 })
  costo_total: number;
}

export class SugerenciasComprasResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 15 })
  total_productos: number;

  @ApiProperty({ example: 12500.5 })
  costo_total_estimado: number;

  @ApiProperty({ type: [SugerenciaCompraItemDto] })
  sugerencias: SugerenciaCompraItemDto[];

  @ApiProperty({ example: '2025-10-15T10:00:00Z' })
  generado_en: string;
}
