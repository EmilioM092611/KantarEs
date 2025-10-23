/* eslint-disable @typescript-eslint/no-unsafe-argument */
// backend/src/cfdi/pac/finkok-pac.provider.ts

import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  PacProvider,
  TimbradorResult,
  CancelacionResult,
  CancelacionRequest,
} from './pac.interface';

/**
 * Proveedor de timbrado Finkok
 * Documentación oficial: http://wiki.finkok.com/
 */
@Injectable()
export class FinkokPacProvider implements PacProvider {
  private readonly logger = new Logger(FinkokPacProvider.name);

  // URLs base según ambiente
  private readonly BASE_URL_PROD =
    'https://facturacion.finkok.com/servicios/soap';
  private readonly BASE_URL_TEST =
    'http://demo-facturacion.finkok.com/servicios/soap';

  private readonly username: string;
  private readonly password: string;
  private readonly rfcEmisor: string;
  private readonly isProduction: boolean;
  private readonly baseUrl: string;

  constructor(private readonly http: HttpService) {
    this.username = process.env.FINKOK_USER || '';
    this.password = process.env.FINKOK_PASSWORD || '';
    this.rfcEmisor = process.env.CFDI_EMISOR_RFC || '';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.baseUrl = this.isProduction ? this.BASE_URL_PROD : this.BASE_URL_TEST;

    if (!this.username || !this.password || !this.rfcEmisor) {
      this.logger.warn(
        '⚠️  Configuración de Finkok incompleta. Revisa: FINKOK_USER, FINKOK_PASSWORD, CFDI_EMISOR_RFC',
      );
    }

    this.logger.log(
      `🔧 Finkok PAC Provider inicializado - Ambiente: ${this.isProduction ? 'PRODUCCIÓN' : 'PRUEBAS'}`,
    );
  }

  /**
   * Timbrar un CFDI en Finkok
   * Nota: Finkok usa SOAP, esta es una implementación simplificada con REST
   */
  async timbrar(payload: { xml: string }): Promise<TimbradorResult> {
    try {
      this.logger.debug('📤 Iniciando timbrado en Finkok...');

      const xmlBase64 = Buffer.from(payload.xml, 'utf8').toString('base64');

      // Finkok usa SOAP, aquí un ejemplo simplificado
      const soapEnvelope = this.buildStampSOAP(xmlBase64);

      const response = await lastValueFrom(
        this.http.post(`${this.baseUrl}/stamp`, soapEnvelope, {
          timeout: 30000,
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: 'http://facturacion.finkok.com/stamp',
          },
        }),
      );

      // Parsear respuesta SOAP (simplificado)
      const xmlResponse = response.data;
      const uuid = this.extractFromSOAP(xmlResponse, 'UUID');
      const xmlTimbrado = this.extractFromSOAP(xmlResponse, 'xml');

      if (!uuid || !xmlTimbrado) {
        throw new Error('Respuesta incompleta de Finkok');
      }

      const xmlFinal = Buffer.from(xmlTimbrado, 'base64').toString('utf8');

      this.logger.log(`✅ CFDI timbrado exitosamente - UUID: ${uuid}`);

      return {
        uuid,
        xml: xmlFinal,
        fecha_timbrado: new Date(),
      };
    } catch (error: any) {
      this.logger.error('❌ Error al timbrar con Finkok:', error.message);

      throw new InternalServerErrorException(
        `Error al timbrar con PAC Finkok: ${error.message}`,
      );
    }
  }

  /**
   * Cancelar un CFDI en Finkok
   */
  async cancelar(
    uuid: string,
    request?: CancelacionRequest,
  ): Promise<CancelacionResult> {
    try {
      this.logger.debug(`📤 Iniciando cancelación de CFDI: ${uuid}`);

      const motivo = request?.motivo || '02';
      const soapEnvelope = this.buildCancelSOAP(
        uuid,
        motivo,
        request?.uuid_relacionado,
      );

      const response = await lastValueFrom(
        this.http.post(`${this.baseUrl}/cancel`, soapEnvelope, {
          timeout: 30000,
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: 'http://facturacion.finkok.com/cancel',
          },
        }),
      );

      const xmlResponse = response.data;
      const acuse = this.extractFromSOAP(xmlResponse, 'Acuse');

      this.logger.log(`✅ CFDI cancelado exitosamente - UUID: ${uuid}`);

      return {
        ok: true,
        acuse,
        estatus: 'cancelado',
        fecha_cancelacion: new Date(),
      };
    } catch (error: any) {
      this.logger.error('❌ Error al cancelar con Finkok:', error.message);

      throw new InternalServerErrorException(
        `Error al cancelar CFDI: ${error.message}`,
      );
    }
  }

  /**
   * Construir sobre SOAP para timbrado
   */
  private buildStampSOAP(xmlBase64: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <stamp xmlns="http://facturacion.finkok.com/stamp">
      <username>${this.username}</username>
      <password>${this.password}</password>
      <xml>${xmlBase64}</xml>
    </stamp>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Construir sobre SOAP para cancelación
   */
  private buildCancelSOAP(
    uuid: string,
    motivo: string,
    uuidRelacionado?: string,
  ): string {
    const sustitucion = uuidRelacionado
      ? `<folioSustitucion>${uuidRelacionado}</folioSustitucion>`
      : '';

    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <cancel xmlns="http://facturacion.finkok.com/cancel">
      <username>${this.username}</username>
      <password>${this.password}</password>
      <rfcEmisor>${this.rfcEmisor}</rfcEmisor>
      <uuid>${uuid}</uuid>
      <motivo>${motivo}</motivo>
      ${sustitucion}
    </cancel>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Extraer valor de respuesta SOAP (parser simple)
   */
  private extractFromSOAP(xml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 's');
    const match = xml.match(regex);
    return match ? match[1] : '';
  }
}
