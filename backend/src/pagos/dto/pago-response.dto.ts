//pago-response.dto.ts
export class PagoResponseDto {
  id_pago: number;
  folio_pago: string;
  id_orden: number;
  folio_orden?: string;
  metodo_pago: string;
  usuario_cobra: string;
  monto: number;
  cambio_entregado: number;
  estado: string;
  fecha_hora_pago: Date;
  referencia_transaccion?: string;
  numero_autorizacion?: string;
}
