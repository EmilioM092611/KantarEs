// backend/src/reportes/dto/refresh-mv.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum MaterializedViewType {
  ANALISIS_VENTAS = 'mv_analisis_ventas',
  PRODUCTOS_VENDIDOS = 'mv_productos_vendidos',
  RESUMEN_INVENTARIO = 'mv_resumen_inventario',
}

export class RefreshMaterializedViewDto {
  @ApiProperty({
    description: 'Nombre de la vista materializada a refrescar',
    enum: MaterializedViewType,
    example: MaterializedViewType.ANALISIS_VENTAS,
    required: false,
  })
  @IsOptional()
  @IsEnum(MaterializedViewType)
  view_name?: MaterializedViewType;

  @ApiProperty({
    description:
      'Refrescar concurrentemente (permite lecturas durante refresh)',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  concurrent?: boolean;
}

export class RefreshMaterializedViewResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'mv_analisis_ventas' })
  view_name: string;

  @ApiProperty({ example: 'Refresh iniciado en background' })
  message: string;

  @ApiProperty({ example: 'job-123-456-789' })
  job_id?: string;

  @ApiProperty({ example: '2025-10-15T10:30:00Z' })
  started_at: string;
}
