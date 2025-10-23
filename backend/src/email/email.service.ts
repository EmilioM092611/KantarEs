/* eslint-disable @typescript-eslint/restrict-template-expressions */
// backend/src/email/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  /**
   * Enviar un email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      this.logger.debug(`📧 Enviando email a: ${options.to}`);

      const result: SentMessageInfo = await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        template: options.template,
        context: options.context,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });

      this.logger.log(
        `✅ Email enviado exitosamente - MessageId: ${result.messageId}`,
      );
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Error al enviar email: ${error.message}`);
      // No lanzamos error para que no falle el proceso principal
      return false;
    }
  }

  /**
   * Enviar email con template Handlebars
   */
  async sendTemplateEmail(
    to: string | string[],
    subject: string,
    template: string,
    context: Record<string, any>,
    attachments?: EmailOptions['attachments'],
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject,
      template,
      context,
      attachments,
    });
  }

  /**
   * Enviar email HTML simple
   */
  async sendHtmlEmail(
    to: string | string[],
    subject: string,
    html: string,
    attachments?: EmailOptions['attachments'],
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject,
      html,
      attachments,
    });
  }

  /**
   * Verificar configuración de email
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: process.env.SMTP_USER,
        subject: 'Test de configuración SMTP',
        text: 'Si recibiste este email, la configuración SMTP está correcta.',
      });

      this.logger.log('✅ Configuración SMTP verificada exitosamente');
      return true;
    } catch (error: any) {
      this.logger.error(`❌ Error en configuración SMTP: ${error.message}`);
      return false;
    }
  }
}
