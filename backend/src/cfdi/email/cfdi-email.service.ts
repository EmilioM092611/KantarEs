// backend/src/cfdi/email/cfdi-email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface EnviarFacturaEmailDto {
  cfdiId: number;
  emailDestinatario?: string; // Si no se proporciona, usa el del receptor
  incluirPdf?: boolean; // Default: true
  incluirXml?: boolean; // Default: true
  mensajePersonalizado?: string;
}

@Injectable()
export class CfdiEmailService {
  private readonly logger = new Logger(CfdiEmailService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Enviar email con factura timbrada
   */
  async enviarFacturaTimbrada(dto: EnviarFacturaEmailDto): Promise<boolean> {
    this.logger.log(`📧 Enviando factura timbrada - CFDI ID: ${dto.cfdiId}`);

    try {
      // 1. Obtener datos del CFDI
      const cfdi = await this.prisma.cfdi_comprobantes.findUnique({
        where: { id_cfdi: dto.cfdiId },
        include: {
          cfdi_receptores: true,
          ordenes: true,
        },
      });

      if (!cfdi) {
        this.logger.error('CFDI no encontrado');
        return false;
      }

      if (cfdi.estatus !== 'timbrado') {
        this.logger.error('CFDI no está timbrado');
        return false;
      }

      // 2. Determinar email destinatario
      const emailDestino = dto.emailDestinatario || cfdi.cfdi_receptores?.email;

      if (!emailDestino) {
        this.logger.error('No hay email de destino');
        return false;
      }

      // 3. Preparar adjuntos
      const attachments: any[] = [];

      // XML (siempre incluir)
      if (dto.incluirXml !== false && cfdi.xml) {
        attachments.push({
          filename: `${cfdi.uuid || 'factura'}.xml`,
          content: Buffer.from(cfdi.xml, 'utf8'),
          contentType: 'application/xml',
        });
      }

      // PDF (si está disponible)
      if (dto.incluirPdf !== false && cfdi.pdf) {
        attachments.push({
          filename: `Factura_${cfdi.uuid || 'documento'}.pdf`,
          content: cfdi.pdf,
          contentType: 'application/pdf',
        });
      }

      // 4. Preparar contexto para el template
      const context = {
        uuid: cfdi.uuid || 'N/A',
        serie: cfdi.serie || '',
        folio: cfdi.folio || '',
        fechaEmision: cfdi.created_at?.toLocaleDateString('es-MX') || '',
        fechaTimbrado: cfdi.fecha_timbrado?.toLocaleDateString('es-MX') || '',
        metodoPago: 'PUE - Pago en una sola exhibición',

        // Emisor
        emisorNombre: process.env.CFDI_EMISOR_NOMBRE || 'Sin nombre',
        emisorRfc: process.env.CFDI_EMISOR_RFC || 'Sin RFC',

        // Receptor
        receptorNombre: cfdi.cfdi_receptores?.razon_social || 'Sin nombre',
        receptorRfc: cfdi.cfdi_receptores?.rfc || 'Sin RFC',
        usoCfdi: cfdi.cfdi_receptores?.uso_cfdi || 'G03',

        // Totales
        total: Number(cfdi.total || 0).toFixed(2),

        // Opcionales
        mostrarBotonVerificar: true,
        emailContacto: process.env.SMTP_FROM || '',
        telefonoContacto: process.env.EMPRESA_TELEFONO || '',

        // Mensaje personalizado
        mensajePersonalizado: dto.mensajePersonalizado,
        mostrarMensajePersonalizado: !!dto.mensajePersonalizado,
      };

      // 5. Enviar email
      const enviado = await this.emailService.sendTemplateEmail(
        emailDestino,
        `Factura Electrónica - ${cfdi.serie || ''}${cfdi.folio || ''} | ${process.env.CFDI_EMISOR_NOMBRE || 'Facturación'}`,
        'cfdi-timbrado',
        context,
        attachments,
      );

      if (enviado) {
        // 6. Registrar envío exitoso
        await this.registrarEnvioEmail(
          dto.cfdiId,
          emailDestino,
          'timbrado',
          true,
        );
        this.logger.log(`✅ Factura enviada exitosamente a: ${emailDestino}`);
      }

      return enviado;
    } catch (error: any) {
      this.logger.error('Error al enviar factura:', error.message);
      await this.registrarEnvioEmail(
        dto.cfdiId,
        dto.emailDestinatario || '',
        'timbrado',
        false,
        error.message,
      );
      return false;
    }
  }

  /**
   * Enviar email de cancelación de factura
   */
  async enviarFacturaCancelada(
    cfdiId: number,
    emailDestinatario?: string,
  ): Promise<boolean> {
    this.logger.log(
      `📧 Enviando notificación de cancelación - CFDI ID: ${cfdiId}`,
    );

    try {
      // 1. Obtener datos del CFDI
      const cfdi = await this.prisma.cfdi_comprobantes.findUnique({
        where: { id_cfdi: cfdiId },
        include: {
          cfdi_receptores: true,
        },
      });

      if (!cfdi) {
        this.logger.error('CFDI no encontrado');
        return false;
      }

      if (cfdi.estatus !== 'cancelado') {
        this.logger.error('CFDI no está cancelado');
        return false;
      }

      // 2. Determinar email destinatario
      const emailDestino = emailDestinatario || cfdi.cfdi_receptores?.email;

      if (!emailDestino) {
        this.logger.warn(
          'No hay email de destino para notificación de cancelación',
        );
        return false;
      }

      // 3. Preparar adjuntos (acuse de cancelación)
      const attachments: any[] = [];

      if (cfdi.acuse_cancelacion) {
        attachments.push({
          filename: `Acuse_Cancelacion_${cfdi.uuid || 'cfdi'}.xml`,
          content: Buffer.from(cfdi.acuse_cancelacion, 'utf8'),
          contentType: 'application/xml',
        });
      }

      // 4. Obtener descripción del motivo
      const motivosMap: Record<string, string> = {
        '01': 'Comprobante emitido con errores con relación',
        '02': 'Comprobante emitido con errores sin relación',
        '03': 'No se llevó a cabo la operación',
        '04': 'Operación nominativa relacionada en una factura global',
      };

      const motivoDescripcion =
        motivosMap[cfdi.motivo_cancelacion || '02'] || 'Sin especificar';

      // 5. Preparar contexto
      const context = {
        uuid: cfdi.uuid || 'N/A',
        serie: cfdi.serie || '',
        folio: cfdi.folio || '',
        fechaEmision: cfdi.created_at?.toLocaleDateString('es-MX') || '',
        fechaCancelacion:
          cfdi.fecha_cancelacion?.toLocaleDateString('es-MX') ||
          new Date().toLocaleDateString('es-MX'),
        total: Number(cfdi.total || 0).toFixed(2),

        // Motivo
        motivoCancelacion: cfdi.motivo_cancelacion || '02',
        motivoDescripcion,
        uuidSustitucion: cfdi.uuid_sustitucion,

        // Emisor
        emisorNombre: process.env.CFDI_EMISOR_NOMBRE || 'Sin nombre',
        emisorRfc: process.env.CFDI_EMISOR_RFC || 'Sin RFC',

        // Receptor
        receptorNombre: cfdi.cfdi_receptores?.razon_social || 'Sin nombre',
        receptorRfc: cfdi.cfdi_receptores?.rfc || 'Sin RFC',

        // Contacto
        emailContacto: process.env.SMTP_FROM || '',
        telefonoContacto: process.env.EMPRESA_TELEFONO || '',
      };

      // 6. Enviar email
      const enviado = await this.emailService.sendTemplateEmail(
        emailDestino,
        `❌ Factura Cancelada - ${cfdi.serie || ''}${cfdi.folio || ''} | ${process.env.CFDI_EMISOR_NOMBRE || 'Facturación'}`,
        'cfdi-cancelado',
        context,
        attachments,
      );

      if (enviado) {
        await this.registrarEnvioEmail(cfdiId, emailDestino, 'cancelado', true);
        this.logger.log(
          `✅ Notificación de cancelación enviada a: ${emailDestino}`,
        );
      }

      return enviado;
    } catch (error: any) {
      this.logger.error(
        'Error al enviar notificación de cancelación:',
        error.message,
      );
      await this.registrarEnvioEmail(
        cfdiId,
        emailDestinatario || '',
        'cancelado',
        false,
        error.message,
      );
      return false;
    }
  }

  /**
   * Registrar envío de email en la base de datos
   */
  private async registrarEnvioEmail(
    cfdiId: number,
    emailDestino: string,
    tipoEnvio: 'timbrado' | 'cancelado',
    exitoso: boolean,
    errorMsg?: string,
  ): Promise<void> {
    try {
      await this.prisma.cfdi_envios_email.create({
        data: {
          id_cfdi: cfdiId,
          email_destino: emailDestino,
          tipo_envio: tipoEnvio,
          exitoso,
          error_msg: errorMsg || null,
          fecha_envio: new Date(),
        },
      });
    } catch (error: any) {
      this.logger.error('Error al registrar envío de email:', error.message);
    }
  }

  /**
   * Obtener historial de envíos de un CFDI
   */
  async obtenerHistorialEnvios(cfdiId: number) {
    return this.prisma.cfdi_envios_email.findMany({
      where: { id_cfdi: cfdiId },
      orderBy: { fecha_envio: 'desc' },
    });
  }
}
