//filter-metodo-pago.dto.ts
import { IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterMetodoPagoDto {
  @ApiPropertyOptional({ description: 'Filtrar por métodos activos/inactivos' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar métodos que requieren referencia',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  requiere_referencia?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar métodos que requieren autorización',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  requiere_autorizacion?: boolean;
}
