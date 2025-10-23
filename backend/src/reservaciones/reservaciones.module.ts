import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { ReservacionesController } from './reservaciones.controller';
import { ReservacionesService } from './services/reservaciones.service';
import { NotificacionesService } from './services/notificaciones.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Módulo de Reservaciones Mejorado
 *
 * Features:
 * - Gestión avanzada de reservaciones
 * - Lista de espera
 * - Recordatorios automáticos (Cron Jobs)
 * - Notificaciones por WhatsApp, SMS y Email
 *
 * Dependencias requeridas:
 * - @nestjs/schedule
 * - @nestjs/config
 * - twilio (para WhatsApp y SMS)
 * - @sendgrid/mail o nodemailer (para Email)
 */
@Module({
  imports: [
    ScheduleModule.forRoot(), // Habilita cron jobs
    ConfigModule, // Para variables de entorno
  ],
  controllers: [ReservacionesController],
  providers: [ReservacionesService, NotificacionesService, PrismaService],
  exports: [ReservacionesService, NotificacionesService],
})
export class ReservacionesModule {}
