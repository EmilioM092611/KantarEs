/* eslint-disable @typescript-eslint/require-await */
// backend/src/notificaciones/notificaciones.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import {
  TipoNotificacion,
  CanalNotificacion,
  PrioridadNotificacion,
} from './interfaces/notification.interface';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(private prisma: PrismaService) {}

  // ==================== ENVIAR NOTIFICACIONES ====================

  async enviar(dto: SendNotificationDto) {
    const expiraEn = dto.expira_en_minutos
      ? new Date(Date.now() + dto.expira_en_minutos * 60000)
      : null;

    const notificacion = await this.prisma.notificaciones.create({
      data: {
        tipo: dto.tipo,
        titulo: dto.titulo,
        mensaje: dto.mensaje,
        canal: dto.canal,
        prioridad: dto.prioridad || PrioridadNotificacion.NORMAL,
        id_orden: dto.id_orden,
        id_mesa: dto.id_mesa,
        id_producto: dto.id_producto,
        id_usuario_destinatario: dto.id_usuario_destinatario,
        id_usuario_origen: dto.id_usuario_origen,
        data: dto.data || {},
        expira_en: expiraEn,
        leida: false,
      },
    });

    this.logger.log(
      `Notificación creada: ${dto.tipo} → ${dto.canal} [ID: ${notificacion.id_notificacion}]`,
    );

    return notificacion;
  }

  async enviarChat(
    id_usuario_origen: number,
    mensaje: string,
    id_usuario_destinatario?: number,
  ) {
    return this.enviar({
      tipo: TipoNotificacion.CHAT_MENSAJE,
      titulo: 'Nuevo mensaje',
      mensaje,
      canal: CanalNotificacion.CHAT,
      id_usuario_origen,
      id_usuario_destinatario,
      prioridad: PrioridadNotificacion.NORMAL,
    });
  }

  // ==================== CONSULTAS ====================

  async obtenerNoLeidas(id_usuario: number, limit: number = 50) {
    return this.prisma.notificaciones.findMany({
      where: {
        AND: [
          {
            OR: [
              { id_usuario_destinatario: id_usuario },
              { canal: CanalNotificacion.BROADCAST },
            ],
          },
          { leida: false },
          {
            OR: [{ expira_en: null }, { expira_en: { gte: new Date() } }],
          },
        ],
      },
      orderBy: {
        fecha_hora: 'desc',
      },
      take: limit,
    });
  }

  async obtenerPorUsuario(
    id_usuario: number,
    limit: number = 100,
    offset: number = 0,
  ) {
    return this.prisma.notificaciones.findMany({
      where: {
        OR: [
          { id_usuario_destinatario: id_usuario },
          { canal: CanalNotificacion.BROADCAST },
        ],
      },
      orderBy: {
        fecha_hora: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  async marcarLeida(id_notificacion: number, id_usuario: number) {
    const notificacion = await this.prisma.notificaciones.findUnique({
      where: { id_notificacion },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    // Verificar que el usuario sea el destinatario
    if (
      notificacion.id_usuario_destinatario &&
      notificacion.id_usuario_destinatario !== id_usuario
    ) {
      throw new NotFoundException('No autorizado');
    }

    return this.prisma.notificaciones.update({
      where: { id_notificacion },
      data: {
        leida: true,
        fecha_leida: new Date(),
      },
    });
  }

  async marcarTodasLeidas(id_usuario: number) {
    return this.prisma.notificaciones.updateMany({
      where: {
        OR: [
          { id_usuario_destinatario: id_usuario },
          { canal: CanalNotificacion.BROADCAST },
        ],
        leida: false,
      },
      data: {
        leida: true,
        fecha_leida: new Date(),
      },
    });
  }

  // ==================== LIMPIEZA ====================

  async limpiarExpiradas() {
    const resultado = await this.prisma.notificaciones.deleteMany({
      where: {
        expira_en: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Notificaciones expiradas eliminadas: ${resultado.count}`);
    return resultado;
  }

  async limpiarAntiguasLeidas(dias: number = 30) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);

    const resultado = await this.prisma.notificaciones.deleteMany({
      where: {
        leida: true,
        fecha_leida: {
          lt: fecha,
        },
      },
    });

    this.logger.log(`Notificaciones antiguas eliminadas: ${resultado.count}`);
    return resultado;
  }

  // ==================== ESTADÍSTICAS ====================

  async obtenerEstadisticas(id_usuario?: number) {
    const where = id_usuario
      ? {
          OR: [
            { id_usuario_destinatario: id_usuario },
            { canal: CanalNotificacion.BROADCAST },
          ],
        }
      : {};

    const [total, noLeidas, porTipo, porCanal] = await Promise.all([
      this.prisma.notificaciones.count({ where }),
      this.prisma.notificaciones.count({
        where: { ...where, leida: false },
      }),
      this.prisma.notificaciones.groupBy({
        by: ['tipo'],
        where,
        _count: { tipo: true },
        orderBy: { _count: { tipo: 'desc' } },
        take: 10,
      }),
      this.prisma.notificaciones.groupBy({
        by: ['canal'],
        where,
        _count: { canal: true },
      }),
    ]);

    return {
      total,
      no_leidas: noLeidas,
      por_tipo: porTipo,
      por_canal: porCanal,
    };
  }
}
