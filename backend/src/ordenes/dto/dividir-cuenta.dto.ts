// ============== ordenes/dto/dividir-cuenta.dto.ts ==============
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemDivisionDto {
  @ApiProperty({ example: 1, description: 'ID del item a incluir' })
  @IsNumber()
  id_detalle: number;

  @ApiProperty({ example: 1, description: 'Cantidad para esta división' })
  @IsNumber()
  @Min(0.01)
  cantidad: number;
}

export class DivisionCuentaDto {
  @ApiProperty({
    example: 'Mesa 1 - División 1',
    description: 'Descripción de esta división',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    type: [ItemDivisionDto],
    description: 'Items incluidos en esta división',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemDivisionDto)
  items: ItemDivisionDto[];
}

export class DividirCuentaDto {
  @ApiProperty({
    type: [DivisionCuentaDto],
    description: 'Divisiones de la cuenta',
    minItems: 2,
  })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => DivisionCuentaDto)
  divisiones: DivisionCuentaDto[];
}
