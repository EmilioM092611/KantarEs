import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { FiltrosCxCDto } from './filtros-cxc.dto';

export class QueryCxCPaginadoDto extends FiltrosCxCDto {
  @ApiProperty({
    description: 'Campo por el cual ordenar',
    example: 'created_at',
    default: 'created_at',
    required: false,
  })
  @IsOptional()
  order_by?: string;

  @ApiProperty({
    description: 'Dirección del ordenamiento',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order_direction?: 'asc' | 'desc';
}

export class CxCPaginadaResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: Array })
  data: any[];

  @ApiProperty({
    example: {
      page: 1,
      limit: 20,
      total: 150,
      total_pages: 8,
      has_next: true,
      has_prev: false,
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };

  @ApiProperty({
    example: {
      saldo_total: 125000.5,
      cuentas_abiertas: 45,
      cuentas_vencidas: 12,
    },
  })
  summary: {
    saldo_total: number;
    cuentas_abiertas: number;
    cuentas_vencidas: number;
  };
}
