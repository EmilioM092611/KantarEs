import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EvaluarProveedorDto {
  @ApiProperty({ description: 'ID del proveedor a evaluar', example: 1 })
  @IsInt()
  id_proveedor: number;

  @ApiProperty({
    description: 'ID del usuario que realiza la evaluación',
    example: 1,
  })
  @IsInt()
  id_usuario_evalua: number;

  @ApiPropertyOptional({
    description: 'ID de la compra asociada (opcional)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  id_compra?: number;

  @ApiProperty({
    description: 'Calificación de calidad de productos (1-5)',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  calidad_productos: number;

  @ApiProperty({
    description: 'Calificación de tiempo de entrega (1-5)',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  tiempo_entrega: number;

  @ApiProperty({
    description: 'Calificación de atención al cliente (1-5)',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  atencion_cliente: number;

  @ApiProperty({
    description: 'Calificación de precios competitivos (1-5)',
    minimum: 1,
    maximum: 5,
    example: 3,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  precios_competitivos: number;

  @ApiProperty({
    description: 'Calificación de comunicación (1-5)',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  comunicacion: number;

  @ApiPropertyOptional({
    description: 'Comentarios adicionales sobre el proveedor',
    example: 'Excelente proveedor, entregas siempre a tiempo',
  })
  @IsOptional()
  @IsString()
  comentarios?: string;
}
