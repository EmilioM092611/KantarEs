// backend/src/productos/recetas/dto/update-receta.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class UpdateRecetaDto {
  @ApiPropertyOptional({
    description: 'Nueva cantidad necesaria del insumo',
    example: 3.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  cantidad_necesaria?: number;

  @ApiPropertyOptional({
    description: 'Nuevo porcentaje de merma esperada',
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  merma_esperada_porcentaje?: number;

  @ApiPropertyOptional({
    description: 'Nuevas notas de preparación',
    example: 'Cortar en cubos medianos',
  })
  @IsOptional()
  @IsString()
  notas_preparacion?: string;
}
