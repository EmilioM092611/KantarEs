// backend/src/productos/combos/dto/query-combos.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryCombosDto {
  @ApiPropertyOptional({
    description: 'Filtrar solo combos válidos (con componentes disponibles)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  solo_validos?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por grupo de opciones',
    example: 'Bebidas',
  })
  @IsOptional()
  @IsString()
  grupo_opciones?: string;

  @ApiPropertyOptional({
    description: 'Incluir solo componentes opcionales',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  solo_opcionales?: boolean;
}
