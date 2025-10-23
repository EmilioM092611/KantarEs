// backend/src/cfdi/pdf/qr-generator.service.ts

import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';

/**
 * Interface para datos del QR del CFDI
 */
export interface QrCfdiData {
  uuid: string;
  rfcEmisor: string;
  rfcReceptor: string;
  total: number;
  sello: string;
}

/**
 * Servicio para generar códigos QR de CFDIs
 */
@Injectable()
export class QrGeneratorService {
  private readonly logger = new Logger(QrGeneratorService.name);

  /**
   * Generar código QR para un CFDI
   * Según especificaciones del SAT: https://www.sat.gob.mx/cs/Satellite?blobcol=urldata&blobkey=id&blobtable=MungoBlobs&blobwhere=1461174200384&ssbinary=true
   *
   * Formato: https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?&id={UUID}&re={RFC_EMISOR}&rr={RFC_RECEPTOR}&tt={TOTAL}&fe={ULTIMOS_8_SELLO}
   */
  async generarQrCfdi(data: QrCfdiData): Promise<Buffer> {
    try {
      this.logger.debug(`Generando QR para CFDI: ${data.uuid}`);

      // Construir URL según especificaciones del SAT
      const totalFormateado = data.total.toFixed(6);
      const selloUltimos8 = data.sello.substring(data.sello.length - 8);

      const url = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?&id=${data.uuid}&re=${data.rfcEmisor}&rr=${data.rfcReceptor}&tt=${totalFormateado}&fe=${selloUltimos8}`;

      // Generar QR
      const qrBuffer = await QRCode.toBuffer(url, {
        type: 'png',
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M',
      });

      this.logger.debug('✅ QR generado exitosamente');
      return qrBuffer;
    } catch (error: any) {
      this.logger.error('Error al generar QR:', error.message);
      throw error;
    }
  }

  /**
   * Generar QR como Data URL (base64)
   */
  async generarQrDataUrl(data: QrCfdiData): Promise<string> {
    try {
      const totalFormateado = data.total.toFixed(6);
      const selloUltimos8 = data.sello.substring(data.sello.length - 8);

      const url = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?&id=${data.uuid}&re=${data.rfcEmisor}&rr=${data.rfcReceptor}&tt=${totalFormateado}&fe=${selloUltimos8}`;

      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M',
      });

      return dataUrl;
    } catch (error: any) {
      this.logger.error('Error al generar QR Data URL:', error.message);
      throw error;
    }
  }
}
