import { IsIn, IsOptional, IsString } from 'class-validator';

// 01=Comprobante emitido con errores con relación
// 02=Comprobante emitido con errores sin relación
// 03=No se llevó a cabo la operación
// 04=Operación nominativa relacionada en una factura global
export class CancelarCfdiDto {
  @IsIn(['01', '02', '03', '04'])
  motivo!: '01' | '02' | '03' | '04';

  // Requerido cuando motivo=01 (sustitución)
  @IsOptional()
  @IsString()
  uuid_relacionado?: string;
}
