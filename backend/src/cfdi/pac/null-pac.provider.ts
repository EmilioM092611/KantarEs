/* eslint-disable @typescript-eslint/require-await */
// backend/src/cfdi/pac/null-pac.provider.ts

import { Injectable, Logger } from '@nestjs/common';
import {
  PacProvider,
  TimbradorResult,
  CancelacionResult,
  CancelacionRequest,
} from './pac.interface';

/**
 * Proveedor PAC Mock para desarrollo y testing
 * Genera UUIDs y XMLs simulados que parecen reales
 *
 * ⚠️  NO USAR EN PRODUCCIÓN - Solo para desarrollo
 */
@Injectable()
export class NullPacProvider implements PacProvider {
  private readonly logger = new Logger(NullPacProvider.name);

  constructor() {
    this.logger.warn(
      '⚠️  USANDO PAC MOCK - Los CFDIs generados NO son válidos ante el SAT',
    );
  }

  /**
   * Genera un UUID v4 aleatorio
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16).toUpperCase();
    });
  }

  /**
   * Genera un número de certificado SAT simulado
   */
  private generateCertificadoSAT(): string {
    return '30001000000400002495'; // Número de certificado ficticio
  }

  /**
   * Genera un sello digital simulado
   */
  private generateSello(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let sello = '';
    for (let i = 0; i < 344; i++) {
      sello += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return sello;
  }

  /**
   * Simula el timbrado agregando un complemento TimbreFiscalDigital al XML
   */
  async timbrar(payload: { xml: string }): Promise<TimbradorResult> {
    const uuid = this.generateUUID();
    const fechaTimbrado = new Date().toISOString();
    const noCertificadoSAT = this.generateCertificadoSAT();
    const selloSAT = this.generateSello();
    const selloCFD = this.generateSello();

    this.logger.debug(`🔧 [MOCK] Timbrando CFDI - UUID generado: ${uuid}`);

    // Insertar complemento TimbreFiscalDigital en el XML
    let xmlTimbrado = payload.xml;

    // Buscar el cierre del comprobante para insertar el complemento antes
    const complementoTFD = `
    <cfdi:Complemento>
      <tfd:TimbreFiscalDigital 
        xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd"
        Version="1.1"
        UUID="${uuid}"
        FechaTimbrado="${fechaTimbrado}"
        RfcProvCertif="SAT970701NN3"
        SelloCFD="${selloCFD}"
        NoCertificadoSAT="${noCertificadoSAT}"
        SelloSAT="${selloSAT}"
      />
    </cfdi:Complemento>`;

    // Insertar el complemento antes del cierre de </cfdi:Comprobante>
    if (xmlTimbrado.includes('</cfdi:Comprobante>')) {
      xmlTimbrado = xmlTimbrado.replace(
        '</cfdi:Comprobante>',
        `${complementoTFD}\n</cfdi:Comprobante>`,
      );
    } else {
      // Si no encuentra el tag, agregarlo al final
      xmlTimbrado = xmlTimbrado.trim() + complementoTFD;
    }

    this.logger.log(`✅ [MOCK] CFDI timbrado - UUID: ${uuid}`);

    return {
      uuid,
      xml: xmlTimbrado,
      fecha_timbrado: new Date(),
      no_certificado_sat: noCertificadoSAT,
      sello_sat: selloSAT,
      cadena_original: `||1.1|${uuid}|${fechaTimbrado}|${selloCFD}|${noCertificadoSAT}||`,
    };
  }

  /**
   * Simula la cancelación de un CFDI
   */
  async cancelar(
    uuid: string,
    request?: CancelacionRequest,
  ): Promise<CancelacionResult> {
    this.logger.debug(`🔧 [MOCK] Cancelando CFDI - UUID: ${uuid}`);

    const motivo = request?.motivo || '02';
    const fechaCancelacion = new Date().toISOString();

    // Generar acuse de cancelación simulado
    const acuse = `<?xml version="1.0" encoding="UTF-8"?>
<Cancelacion 
  xmlns="http://cancelacfd.sat.gob.mx" 
  xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  Fecha="${fechaCancelacion}"
  RfcEmisor="RFC000000000">
  <Folios>
    <UUID>${uuid}</UUID>
    <Motivo>${motivo}</Motivo>
    <EstatusCancelacion>Cancelado</EstatusCancelacion>
  </Folios>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
    </SignedInfo>
    <SignatureValue>${this.generateSello()}</SignatureValue>
  </Signature>
</Cancelacion>`;

    this.logger.log(`✅ [MOCK] CFDI cancelado - UUID: ${uuid}`);

    return {
      ok: true,
      acuse,
      estatus: 'cancelado',
      mensaje: '[MOCK] Cancelación simulada exitosa',
      fecha_cancelacion: new Date(),
    };
  }

  /**
   * Simula la verificación de estatus
   */
  async verificarEstatus(uuid: string): Promise<{
    estatus: 'vigente' | 'cancelado' | 'no_encontrado';
    es_cancelable?: boolean;
    estado_cancelacion?: string;
  }> {
    this.logger.debug(`🔧 [MOCK] Verificando estatus - UUID: ${uuid}`);

    // Simulamos que todos los CFDIs están vigentes y son cancelables
    return {
      estatus: 'vigente',
      es_cancelable: true,
      estado_cancelacion: 'No cancelado',
    };
  }
}
