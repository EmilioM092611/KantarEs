import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { AreaPreparacion } from '../../categorias/dto/create-categoria.dto';

export class QueryTiposProductoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  activo?: boolean;

  @ApiProperty({ enum: AreaPreparacion, required: false })
  @IsOptional()
  @IsEnum(AreaPreparacion)
  area_preparacion?: string;
}
