import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Página actual' })
  page: number;

  @ApiProperty({ example: 20, description: 'Resultados por página' })
  limit: number;

  @ApiProperty({ example: 150, description: 'Total de registros' })
  total: number;

  @ApiProperty({ example: 8, description: 'Total de páginas' })
  total_pages: number;

  @ApiProperty({ example: true, description: 'Hay página siguiente' })
  has_next: boolean;

  @ApiProperty({ example: false, description: 'Hay página anterior' })
  has_prev: boolean;
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: 'Array de datos', type: 'array' })
  data: T[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;

  @ApiProperty({ example: '2025-10-15T10:30:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/productos' })
  path: string;
}
