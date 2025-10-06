//proveedor-response.dto.ts
import { Exclude, Expose, Type } from 'class-transformer';

export class ProveedorResponseDto {
  @Expose()
  id_proveedor: number;

  @Expose()
  razon_social: string;

  @Expose()
  nombre_comercial?: string;

  @Expose()
  rfc: string;

  @Expose()
  direccion?: string;

  @Expose()
  ciudad?: string;

  @Expose()
  estado?: string;

  @Expose()
  codigo_postal?: string;

  @Expose()
  telefono?: string;

  @Expose()
  email?: string;

  @Expose()
  contacto_nombre?: string;

  @Expose()
  contacto_telefono?: string;

  @Expose()
  dias_credito?: number;

  @Expose()
  limite_credito?: number;

  @Expose()
  cuenta_bancaria?: string;

  @Expose()
  banco?: string;

  @Expose()
  calificacion?: number;

  @Expose()
  activo?: boolean;

  @Expose()
  @Type(() => Date)
  created_at?: Date;

  @Expose()
  @Type(() => Date)
  updated_at?: Date;
}

export class ProveedorWithComprasDto extends ProveedorResponseDto {
  @Expose()
  total_compras?: number;

  @Expose()
  ultima_compra?: Date;

  @Expose()
  total_gastado?: number;
}

export class PaginatedProveedoresDto {
  @Expose()
  data: ProveedorResponseDto[];

  @Expose()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
