/* eslint-disable @typescript-eslint/no-unsafe-argument */
// backend/src/cfdi/pac/sw-pac.provider.ts

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
 * Proveedor de timbrado SW Smarterweb
 * Documentación oficial: https://developers.sw.com.mx/
 */
@Injectable()
export class SwPacProvider implements PacProvider {
  private readonly logger = new Logger(SwPacProvider.name);

  // URLs base según ambiente
  private readonly BASE_URL_PROD = 'https://services.sw.com.mx';
  private readonly BASE_URL_TEST = 'https://services.test.sw.com.mx';

  // Credenciales y configuración
  private readonly user: string;
  private readonly password: string;
  private readonly rfcEmisor: string;
  private readonly isProduction: boolean;
  private readonly baseUrl: string;

  // Token de autenticación (cache)
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private readonly http: HttpService) {
    // Cargar configuración desde variables de entorno
    this.user = process.env.SW_USER || '';
    this.password = process.env.SW_PASSWORD || '';
    this.rfcEmisor = process.env.CFDI_EMISOR_RFC || '';
    this.isProduction = process.env.NODE_ENV === 'production';
    this.baseUrl = this.isProduction ? this.BASE_URL_PROD : this.BASE_URL_TEST;

    // Validar configuración
    if (!this.user || !this.password || !this.rfcEmisor) {
      this.logger.warn(
        '⚠️  Configuración de SW incompleta. Revisa las variables de entorno: SW_USER, SW_PASSWORD, CFDI_EMISOR_RFC',
      );
    }

    this.logger.log(
      `🔧 SW PAC Provider inicializado - Ambiente: ${this.isProduction ? 'PRODUCCIÓN' : 'PRUEBAS'}`,
    );
  }

  /**
   * Obtener token de autenticación de SW
   * Implementa caché de token para evitar múltiples llamadas
   */
  private async getToken(): Promise<string> {
    // Si tenemos token válido, usarlo
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }

    try {
      this.logger.debug('🔑 Obteniendo nuevo token de SW...');

      const response = await lastValueFrom(
        this.http.post(
          `${this.baseUrl}/security/authenticate`,
          {
            user: this.user,
            password: this.password,
          },
          {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

      const data = response.data?.data;
      if (!data?.token) {
        throw new Error('No se recibió token en la respuesta de SW');
      }

      const newToken = data.token as string;
      this.token = newToken;
      // El token de SW expira en 5 minutos, lo renovamos antes
      this.tokenExpiry = new Date(Date.now() + 4 * 60 * 1000);

      this.logger.debug('✅ Token obtenido exitosamente');

      return newToken;
    } catch (error: any) {
      this.logger.error('❌ Error al obtener token de SW:', error.message);
      throw new InternalServerErrorException(
        'Error de autenticación con el PAC',
      );
    }
  }

  /**
   * Timbrar un CFDI en SW Smarterweb
   */
  async timbrar(payload: { xml: string }): Promise<TimbradorResult> {
    try {
      this.logger.debug('📤 Iniciando timbrado en SW...');

      const token = await this.getToken();
      const xmlBase64 = Buffer.from(payload.xml, 'utf8').toString('base64');

      const response = await lastValueFrom(
        this.http.post(
          `${this.baseUrl}/cfdi-service/issue/v1`,
          { xml: xmlBase64 },
          {
            timeout: 30000, // 30 segundos timeout
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      const data = response.data?.data;

      if (!data || response.data?.status !== 'success') {
        const errorMsg = response.data?.message || 'Error desconocido del PAC';
        throw new Error(errorMsg);
      }

      // Extraer datos del timbrado
      const uuid = data.uuid || data.UUID;
      const xmlTimbrado = data.cfdi || data.xml;

      if (!uuid || !xmlTimbrado) {
        throw new Error('Respuesta incompleta del PAC: falta UUID o XML');
      }

      // Decodificar XML si viene en base64
      const xmlFinal = xmlTimbrado.startsWith('<?xml')
        ? xmlTimbrado
        : Buffer.from(xmlTimbrado, 'base64').toString('utf8');

      this.logger.log(`✅ CFDI timbrado exitosamente - UUID: ${uuid}`);

      return {
        uuid,
        xml: xmlFinal,
        fecha_timbrado: data.fechaTimbrado
          ? new Date(data.fechaTimbrado)
          : new Date(),
        no_certificado_sat: data.noCertificadoSAT,
        sello_sat: data.selloSAT,
        cadena_original: data.cadenaOriginal,
      };
    } catch (error: any) {
      this.logger.error('❌ Error al timbrar CFDI:', {
        message: error.message,
        response: error.response?.data,
      });

      // Extraer mensaje de error específico de SW
      const swError = error.response?.data;
      const errorMessage =
        swError?.messageDetail || swError?.message || error.message;

      throw new InternalServerErrorException(
        `Error al timbrar con PAC: ${errorMessage}`,
      );
    }
  }

  /**
   * Cancelar un CFDI en SW Smarterweb
   */
  async cancelar(
    uuid: string,
    request?: CancelacionRequest,
  ): Promise<CancelacionResult> {
    try {
      this.logger.debug(`📤 Iniciando cancelación de CFDI: ${uuid}`);

      const token = await this.getToken();
      const motivo = request?.motivo || '02';

      const requestBody: any = {
        rfc: this.rfcEmisor,
        uuid,
        motivo,
      };

      // Agregar UUID de sustitución si aplica
      if (motivo === '01' && request?.uuid_relacionado) {
        requestBody.folioSustitucion = request.uuid_relacionado;
      }

      const response = await lastValueFrom(
        this.http.post(`${this.baseUrl}/cfdi-service/cancel/v1`, requestBody, {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      const data = response.data?.data;
      const isSuccess = response.data?.status === 'success';

      if (!isSuccess) {
        const errorMsg = response.data?.message || 'Error al cancelar CFDI';
        throw new Error(errorMsg);
      }

      this.logger.log(`✅ CFDI cancelado exitosamente - UUID: ${uuid}`);

      return {
        ok: true,
        acuse: data?.acuse || data?.acuseCancelacion,
        estatus: data?.estatusCancelacion || 'cancelado',
        mensaje: response.data?.message,
        fecha_cancelacion: new Date(),
      };
    } catch (error: any) {
      this.logger.error('❌ Error al cancelar CFDI:', {
        uuid,
        message: error.message,
        response: error.response?.data,
      });

      const swError = error.response?.data;
      const errorMessage =
        swError?.messageDetail || swError?.message || error.message;

      throw new InternalServerErrorException(
        `Error al cancelar CFDI: ${errorMessage}`,
      );
    }
  }

  /**
   * Verificar el estatus de un CFDI
   */
  async verificarEstatus(uuid: string): Promise<{
    estatus: 'vigente' | 'cancelado' | 'no_encontrado';
    es_cancelable?: boolean;
    estado_cancelacion?: string;
  }> {
    try {
      this.logger.debug(`🔍 Consultando estatus de CFDI: ${uuid}`);

      const token = await this.getToken();

      const response = await lastValueFrom(
        this.http.post(
          `${this.baseUrl}/cfdi-service/validate/v1`,
          {
            rfc: this.rfcEmisor,
            uuid,
          },
          {
            timeout: 15000,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      const data = response.data?.data;

      return {
        estatus: data?.estatusCFDI === 'Vigente' ? 'vigente' : 'cancelado',
        es_cancelable: data?.esCancelable === 'Cancelable',
        estado_cancelacion: data?.estatusCancelacion,
      };
    } catch (error: any) {
      this.logger.error('❌ Error al verificar estatus:', error.message);
      return {
        estatus: 'no_encontrado',
      };
    }
  }
}
