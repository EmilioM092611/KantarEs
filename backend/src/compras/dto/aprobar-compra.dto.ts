import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DecisionAprobacion {
  APROBAR = 'aprobar',
  RECHAZAR = 'rechazar',
}

export class AprobarCompraDto {
  @ApiProperty({
    description: 'ID de la compra a aprobar/rechazar',
    example: 123,
  })
  @IsInt()
  id_compra: number;

  @ApiProperty({
    description: 'ID del usuario que aprueba/rechaza',
    example: 1,
  })
  @IsInt()
  id_usuario_aprueba: number;

  @ApiProperty({
    description: 'Decisión de aprobación',
    enum: DecisionAprobacion,
    example: DecisionAprobacion.APROBAR,
  })
  @IsEnum(DecisionAprobacion)
  decision: DecisionAprobacion;

  @ApiProperty({
    description: 'Nivel de aprobación (1=Gerente, 2=Director, 3=CEO)',
    example: 1,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  nivel: number;

  @ApiPropertyOptional({
    description: 'Observaciones sobre la aprobación/rechazo',
    example: 'Aprobado por exceder presupuesto mensual',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
