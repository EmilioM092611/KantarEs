// backend/src/email/email.controller.ts (NUEVO)

import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Email - Testing')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('test')
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Probar configuración de email',
    description:
      'Envía un email de prueba al email configurado en SMTP_USER para verificar que la configuración SMTP es correcta. Útil para diagnosticar problemas de configuración antes de enviar facturas reales. Solo Administrador puede ejecutar este endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de prueba enviado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Email de prueba enviado exitosamente',
        data: {
          destinatario: 'tu_email@gmail.com',
          servidor: 'smtp.gmail.com',
          puerto: 587,
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error al enviar email de prueba',
    schema: {
      example: {
        success: false,
        message: 'Error al enviar email de prueba',
        error: 'Invalid login: 535-5.7.8 Username and Password not accepted',
      },
    },
  })
  async testEmail() {
    const destinatario = process.env.SMTP_USER || 'sin_configurar@email.com';

    const enviado = await this.emailService.sendHtmlEmail(
      destinatario,
      '✅ Test de Configuración SMTP - Sistema CFDI',
      `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 30px; border-radius: 10px;">
              <h1 style="color: #27ae60;">✅ Configuración SMTP Correcta</h1>
              <p>Si estás leyendo este email, significa que la configuración SMTP de tu sistema está funcionando correctamente.</p>
              
              <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h2 style="color: #2c3e50; margin-top: 0;">Configuración actual:</h2>
                <ul style="list-style: none; padding: 0;">
                  <li><strong>Servidor:</strong> ${process.env.SMTP_HOST}</li>
                  <li><strong>Puerto:</strong> ${process.env.SMTP_PORT}</li>
                  <li><strong>Usuario:</strong> ${process.env.SMTP_USER}</li>
                  <li><strong>Remitente:</strong> ${process.env.SMTP_FROM}</li>
                </ul>
              </div>
              
              <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60;">
                <p style="margin: 0;"><strong>✅ Todo listo!</strong> Puedes comenzar a enviar facturas por email.</p>
              </div>
              
              <p style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
                Este es un email automático generado por el sistema de facturación.
              </p>
            </div>
          </body>
        </html>
      `,
    );

    if (!enviado) {
      return {
        success: false,
        message: 'Error al enviar email de prueba',
        error: 'Revisa la configuración SMTP en el archivo .env',
        config: {
          servidor: process.env.SMTP_HOST,
          puerto: process.env.SMTP_PORT,
          usuario: process.env.SMTP_USER,
          remitente: process.env.SMTP_FROM,
        },
      };
    }

    return {
      success: true,
      message: 'Email de prueba enviado exitosamente',
      data: {
        destinatario,
        servidor: process.env.SMTP_HOST,
        puerto: parseInt(process.env.SMTP_PORT || '587'),
      },
    };
  }
}
