// dto/create-compra.dto.ts
import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCompraDetalleDto } from './create-compra-detalle.dto';

export class CreateCompraDto {
  @ApiProperty({ example: 1, description: 'ID del proveedor' })
  @IsInt()
  @Type(() => Number)
  id_proveedor: number;

  @ApiProperty({ example: 1, description: 'ID del usuario que solicita' })
  @IsInt()
  @Type(() => Number)
  id_usuario_solicita: number;

  @ApiProperty({ example: '2024-10-03', description: 'Fecha del pedido' })
  @IsDateString()
  fecha_pedido: string;

  @ApiPropertyOptional({ example: 'Pedido urgente' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({
    type: [CreateCompraDetalleDto],
    description: 'Detalle de productos',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCompraDetalleDto)
  detalle: CreateCompraDetalleDto[];
}
