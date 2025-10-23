/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio de Notificaciones
 * Gestiona el envío de recordatorios por WhatsApp, SMS y Email
 *
 * NOTA: Este es un servicio base. Deberás integrarlo con:
 * - Twilio (para WhatsApp y SMS)
 * - SendGrid / Nodemailer (para Email)
 */
@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Enviar recordatorio de reservación 24h antes
   */
  async enviarRecordatorioReservacion(data: {
    nombre: string;
    telefono: string;
    email?: string;
    fecha_reservacion: Date;
    numero_mesa?: string;
    personas: number;
    metodo: 'whatsapp' | 'sms' | 'email';
  }): Promise<boolean> {
    try {
      switch (data.metodo) {
        case 'whatsapp':
          return await this.enviarWhatsApp(data);
        case 'sms':
          return await this.enviarSMS(data);
        case 'email':
          return await this.enviarEmail(data);
        default:
          this.logger.warn(`Método de contacto no soportado: ${data.metodo}`);
          return false;
      }
    } catch (error) {
      this.logger.error(
        `Error enviando recordatorio: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Enviar notificación de lista de espera
   */
  async notificarListaEspera(data: {
    nombre: string;
    telefono: string;
    personas: number;
    tiempo_espera: number;
    metodo: 'whatsapp' | 'sms' | 'llamada';
    mensaje?: string;
  }): Promise<boolean> {
    try {
      const mensajeDefault = `Hola ${data.nombre}, tu mesa para ${data.personas} personas está lista. Por favor dirígete al restaurante. Gracias por tu espera.`;

      const mensaje = data.mensaje || mensajeDefault;

      if (data.metodo === 'whatsapp') {
        return await this.enviarWhatsAppSimple(data.telefono, mensaje);
      } else if (data.metodo === 'sms') {
        return await this.enviarSMSSimple(data.telefono, mensaje);
      } else {
        // Para llamadas, registrar y retornar true (implementación manual)
        this.logger.log(`Llamar a ${data.telefono} para notificar mesa lista`);
        return true;
      }
    } catch (error) {
      this.logger.error(
        `Error notificando lista de espera: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Enviar confirmación de reservación
   */
  async enviarConfirmacion(data: {
    nombre: string;
    telefono: string;
    email?: string;
    fecha_reservacion: Date;
    numero_mesa?: string;
    personas: number;
    folio?: string;
  }): Promise<boolean> {
    try {
      const mensaje = this.construirMensajeConfirmacion(data);

      // Enviar por WhatsApp (principal)
      await this.enviarWhatsAppSimple(data.telefono, mensaje);

      // Si tiene email, enviar confirmación también por email
      if (data.email) {
        await this.enviarEmailConfirmacion(data);
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Error enviando confirmación: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  // ============== MÉTODOS PRIVADOS ==============

  /**
   * Enviar WhatsApp usando Twilio
   */
  private async enviarWhatsApp(data: any): Promise<boolean> {
    const mensaje = this.construirMensajeRecordatorio(data);
    return await this.enviarWhatsAppSimple(data.telefono, mensaje);
  }

  /**
   * Enviar WhatsApp simple
   */
  private async enviarWhatsAppSimple(
    telefono: string,
    mensaje: string,
  ): Promise<boolean> {
    try {
      // TODO: Integrar con Twilio WhatsApp API
      // const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      // const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
      // const from = this.configService.get('TWILIO_WHATSAPP_NUMBER');

      // const client = require('twilio')(accountSid, authToken);
      // await client.messages.create({
      //   from: `whatsapp:${from}`,
      //   to: `whatsapp:${telefono}`,
      //   body: mensaje,
      // });

      this.logger.log(`[SIMULADO] WhatsApp a ${telefono}: ${mensaje}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando WhatsApp: ${error.message}`);
      return false;
    }
  }

  /**
   * Enviar SMS usando Twilio
   */
  private async enviarSMS(data: any): Promise<boolean> {
    const mensaje = this.construirMensajeRecordatorio(data);
    return await this.enviarSMSSimple(data.telefono, mensaje);
  }

  /**
   * Enviar SMS simple
   */
  private async enviarSMSSimple(
    telefono: string,
    mensaje: string,
  ): Promise<boolean> {
    try {
      // TODO: Integrar con Twilio SMS API
      // const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      // const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
      // const from = this.configService.get('TWILIO_PHONE_NUMBER');

      // const client = require('twilio')(accountSid, authToken);
      // await client.messages.create({
      //   from: from,
      //   to: telefono,
      //   body: mensaje,
      // });

      this.logger.log(`[SIMULADO] SMS a ${telefono}: ${mensaje}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando SMS: ${error.message}`);
      return false;
    }
  }

  /**
   * Enviar Email usando SendGrid o Nodemailer
   */
  private async enviarEmail(data: any): Promise<boolean> {
    try {
      // TODO: Integrar con SendGrid o Nodemailer
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));

      // const msg = {
      //   to: data.email,
      //   from: this.configService.get('EMAIL_FROM'),
      //   subject: 'Recordatorio de Reservación',
      //   html: this.construirEmailRecordatorio(data),
      // };

      // await sgMail.send(msg);

      this.logger.log(
        `[SIMULADO] Email a ${data.email}: Recordatorio de reservación`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email: ${error.message}`);
      return false;
    }
  }

  /**
   * Enviar email de confirmación
   */
  private async enviarEmailConfirmacion(data: any): Promise<boolean> {
    try {
      this.logger.log(
        `[SIMULADO] Email confirmación a ${data.email}: Reservación confirmada`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email confirmación: ${error.message}`);
      return false;
    }
  }

  // ============== CONSTRUCCIÓN DE MENSAJES ==============

  private construirMensajeRecordatorio(data: any): string {
    const fecha = new Date(data.fecha_reservacion).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const hora = new Date(data.fecha_reservacion).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let mensaje = `Hola ${data.nombre},\n\n`;
    mensaje += `Te recordamos tu reservación:\n`;
    mensaje += `📅 Fecha: ${fecha}\n`;
    mensaje += `⏰ Hora: ${hora}\n`;
    mensaje += `👥 Personas: ${data.personas}\n`;

    if (data.numero_mesa) {
      mensaje += `🪑 Mesa: ${data.numero_mesa}\n`;
    }

    mensaje += `\n¡Te esperamos! 🎉`;

    return mensaje;
  }

  private construirMensajeConfirmacion(data: any): string {
    const fecha = new Date(data.fecha_reservacion).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const hora = new Date(data.fecha_reservacion).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let mensaje = `✅ Reservación Confirmada\n\n`;
    mensaje += `Hola ${data.nombre},\n\n`;
    mensaje += `Tu reservación ha sido confirmada:\n`;
    mensaje += `📅 ${fecha}\n`;
    mensaje += `⏰ ${hora}\n`;
    mensaje += `👥 ${data.personas} personas\n`;

    if (data.numero_mesa) {
      mensaje += `🪑 Mesa: ${data.numero_mesa}\n`;
    }

    if (data.folio) {
      mensaje += `📋 Folio: ${data.folio}\n`;
    }

    mensaje += `\n¡Gracias por tu preferencia!`;

    return mensaje;
  }

  private construirEmailRecordatorio(data: any): string {
    const fecha = new Date(data.fecha_reservacion).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const hora = new Date(data.fecha_reservacion).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recordatorio de Reservación</h1>
          </div>
          <div class="content">
            <p>Hola ${data.nombre},</p>
            <p>Te recordamos que tienes una reservación próxima:</p>
            <div class="details">
              <p><strong>📅 Fecha:</strong> ${fecha}</p>
              <p><strong>⏰ Hora:</strong> ${hora}</p>
              <p><strong>👥 Personas:</strong> ${data.personas}</p>
              ${data.numero_mesa ? `<p><strong>🪑 Mesa:</strong> ${data.numero_mesa}</p>` : ''}
            </div>
            <p>¡Te esperamos!</p>
          </div>
          <div class="footer">
            <p>Si necesitas cancelar o modificar tu reservación, contáctanos.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
