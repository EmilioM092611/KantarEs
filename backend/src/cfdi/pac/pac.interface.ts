// backend/src/cfdi/pac/pac.interface.ts

/**
 * Resultado del proceso de timbrado
 */
export interface TimbradorResult {
  uuid: string; // UUID generado por el SAT
  xml: string; // XML timbrado con complemento
  fecha_timbrado?: Date; // Fecha de timbrado
  no_certificado_sat?: string; // Número de certificado del SAT
  sello_sat?: string; // Sello digital del SAT
  cadena_original?: string; // Cadena original del complemento
}

/**
 * Resultado del proceso de cancelación
 */
export interface CancelacionResult {
  ok: boolean; // Si la cancelación fue exitosa
  acuse?: string; // XML del acuse de cancelación
  estatus?: string; // Estado de la cancelación
  mensaje?: string; // Mensaje descriptivo
  fecha_cancelacion?: Date; // Fecha de cancelación
}

/**
 * DTO para cancelación de CFDI
 */
export interface CancelacionRequest {
  motivo: '01' | '02' | '03' | '04'; // Motivo de cancelación SAT
  uuid_relacionado?: string; // UUID de sustitución (si aplica)
  folioSustitucion?: string; // Folio de sustitución (alias)
}

/**
 * Interface abstracta que deben implementar todos los proveedores de PAC
 */
export abstract class PacProvider {
  /**
   * Timbrar un CFDI ante el SAT
   * @param payload - XML a timbrar y datos adicionales
   * @returns Resultado del timbrado con UUID y XML timbrado
   */
  abstract timbrar(payload: {
    xml: string;
    [key: string]: any;
  }): Promise<TimbradorResult>;

  /**
   * Cancelar un CFDI ante el SAT
   * @param uuid - UUID del CFDI a cancelar
   * @param request - Datos de la solicitud de cancelación
   * @returns Resultado de la cancelación
   */
  abstract cancelar(
    uuid: string,
    request?: CancelacionRequest,
  ): Promise<CancelacionResult>;

  /**
   * Verificar el estatus de un CFDI
   * @param uuid - UUID del CFDI
   * @returns Información del estatus
   */
  abstract verificarEstatus?(uuid: string): Promise<{
    estatus: 'vigente' | 'cancelado' | 'no_encontrado';
    es_cancelable?: boolean;
    estado_cancelacion?: string;
  }>;
}
