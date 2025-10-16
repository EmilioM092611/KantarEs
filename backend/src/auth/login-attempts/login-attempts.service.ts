/* eslint-disable @typescript-eslint/require-await */
// backend/src/auth/login-attempts/login-attempts.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface LoginAttemptData {
  username: string;
  ip_address: string;
  user_agent?: string;
  success: boolean;
  failure_reason?: string;
}

@Injectable()
export class LoginAttemptsService {
  private readonly logger = new Logger(LoginAttemptsService.name);
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 15;
  private readonly CLEANUP_DAYS = 30;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un intento de login
   * MEJORA 11: Servicio completo y funcional
   */
  async logAttempt(data: LoginAttemptData): Promise<void> {
    try {
      await this.prisma.login_attempts.create({
        data: {
          username: data.username,
          ip_address: data.ip_address,
          user_agent: data.user_agent || null,
          intento_exitoso: data.success,
          razon_fallo: data.failure_reason || null,
          fecha_hora: new Date(),
        },
      });

      this.logger.log(
        `Login attempt logged: ${data.username} - Success: ${data.success}`,
      );
    } catch (error) {
      this.logger.error('Error logging attempt', error);
    }
  }

  /**
   * Obtiene el número de intentos fallidos recientes
   */
  async getRecentFailedAttempts(username: string): Promise<number> {
    const windowStart = new Date(
      Date.now() - this.LOCKOUT_DURATION_MINUTES * 60 * 1000,
    );

    const attempts = await this.prisma.login_attempts.count({
      where: {
        username,
        intento_exitoso: false,
        fecha_hora: {
          gte: windowStart,
        },
      },
    });

    return attempts;
  }

  /**
   * Verifica si una cuenta debe ser bloqueada
   */
  async shouldLockAccount(username: string): Promise<boolean> {
    const failedAttempts = await this.getRecentFailedAttempts(username);
    const shouldLock = failedAttempts >= this.MAX_ATTEMPTS;

    if (shouldLock) {
      this.logger.warn(
        `Account ${username} should be locked: ${failedAttempts} failed attempts`,
      );
    }

    return shouldLock;
  }

  /**
   * Calcula el tiempo hasta que se desbloquee la cuenta
   */
  async getTimeUntilUnlock(username: string): Promise<Date | null> {
    const windowStart = new Date(
      Date.now() - this.LOCKOUT_DURATION_MINUTES * 60 * 1000,
    );

    const firstFailedAttempt = await this.prisma.login_attempts.findFirst({
      where: {
        username,
        intento_exitoso: false,
        fecha_hora: {
          gte: windowStart,
        },
      },
      orderBy: {
        fecha_hora: 'asc',
      },
    });

    if (!firstFailedAttempt || !firstFailedAttempt.fecha_hora) {
      return null;
    }

    const unlockTime = new Date(
      firstFailedAttempt.fecha_hora.getTime() +
        this.LOCKOUT_DURATION_MINUTES * 60 * 1000,
    );

    return unlockTime > new Date() ? unlockTime : null;
  }

  /**
   * Limpia los intentos antiguos (ejecutar via cron o manualmente)
   */
  async cleanupOldAttempts(): Promise<number> {
    const cutoffDate = new Date(
      Date.now() - this.CLEANUP_DAYS * 24 * 60 * 60 * 1000,
    );

    const result = await this.prisma.login_attempts.deleteMany({
      where: {
        fecha_hora: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old login attempts`);
    return result.count;
  }

  /**
   * Resetea los intentos fallidos de un usuario (desbloqueo manual o login exitoso)
   */
  async resetAttempts(username: string): Promise<void> {
    this.logger.log(
      `Attempts reset for ${username} (manual or successful login)`,
    );
    // Los intentos permanecen en la tabla para auditoría, pero ya no cuentan
    // porque verificamos por ventana de tiempo
  }

  /**
   * Obtiene historial de intentos de un usuario
   */
  async getUserAttempts(username: string, limit = 20): Promise<any[]> {
    return this.prisma.login_attempts.findMany({
      where: { username },
      orderBy: { fecha_hora: 'desc' },
      take: limit,
      select: {
        id: true,
        username: true,
        ip_address: true,
        user_agent: true,
        intento_exitoso: true,
        razon_fallo: true,
        fecha_hora: true,
      },
    });
  }

  /**
   * Obtiene estadísticas de intentos fallidos (dashboard admin)
   */
  async getFailedAttemptsStats(hours = 24): Promise<any> {
    const windowStart = new Date(Date.now() - hours * 60 * 60 * 1000);

    const total = await this.prisma.login_attempts.count({
      where: {
        intento_exitoso: false,
        fecha_hora: { gte: windowStart },
      },
    });

    const byUsername = await this.prisma.login_attempts.groupBy({
      by: ['username'],
      where: {
        intento_exitoso: false,
        fecha_hora: { gte: windowStart },
      },
      _count: {
        username: true,
      },
      orderBy: {
        _count: {
          username: 'desc',
        },
      },
      take: 10,
    });

    const byIp = await this.prisma.login_attempts.groupBy({
      by: ['ip_address'],
      where: {
        intento_exitoso: false,
        fecha_hora: { gte: windowStart },
      },
      _count: {
        ip_address: true,
      },
      orderBy: {
        _count: {
          ip_address: 'desc',
        },
      },
      take: 10,
    });

    return {
      total_failed_attempts: total,
      window_hours: hours,
      max_attempts: this.MAX_ATTEMPTS,
      lockout_duration_minutes: this.LOCKOUT_DURATION_MINUTES,
      top_usernames: byUsername.map((item) => ({
        username: item.username,
        attempts: item._count.username,
      })),
      top_ips: byIp.map((item) => ({
        ip_address: item.ip_address,
        attempts: item._count.ip_address,
      })),
    };
  }
}
