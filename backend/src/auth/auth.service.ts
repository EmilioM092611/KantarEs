/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginAttemptsService } from './login-attempts/login-attempts.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private loginAttemptsService: LoginAttemptsService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.usuarios.findFirst({
      where: { username, activo: true },
      include: {
        roles: true,
        personas: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    return user;
  }

  // === MEJORA 11: Integración con login_attempts ===
  async login(
    loginDto: { username: string; password: string },
    ipAddress: string,
    userAgent?: string,
  ) {
    const { username, password } = loginDto;

    // 1. Verificar si la cuenta está bloqueada
    const isLocked =
      await this.loginAttemptsService.shouldLockAccount(username);

    if (isLocked) {
      const unlockTime =
        await this.loginAttemptsService.getTimeUntilUnlock(username);

      // Registrar intento mientras está bloqueada
      await this.loginAttemptsService.logAttempt({
        username,
        ip_address: ipAddress,
        user_agent: userAgent,
        success: false,
        failure_reason: 'Cuenta bloqueada',
      });

      throw new HttpException(
        {
          success: false,
          message: 'Cuenta bloqueada por múltiples intentos fallidos',
          unlockTime: unlockTime,
        },
        HttpStatus.LOCKED,
      );
    }

    try {
      // 2. Validar credenciales
      const user = await this.validateUser(username, password);

      // 3. Login exitoso - registrar y resetear intentos
      await this.loginAttemptsService.logAttempt({
        username,
        ip_address: ipAddress,
        user_agent: userAgent,
        success: true,
      });

      await this.loginAttemptsService.resetAttempts(username);

      // 4. Actualizar último acceso
      await this.prisma.usuarios.update({
        where: { id_usuario: user.id_usuario },
        data: {
          ultimo_acceso: new Date(),
          intentos_fallidos: 0,
          bloqueado_hasta: null,
        },
      });

      // 5. Generar token
      const payload = {
        sub: user.id_usuario,
        username: user.username,
        rol: user.roles.nombre,
      };

      return {
        success: true,
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id_usuario,
          username: user.username,
          email: user.email,
          nombre: `${user.personas.nombre} ${user.personas.apellido_paterno}`,
          rol: user.roles.nombre,
        },
      };
    } catch (error) {
      // 6. Login fallido - registrar intento
      await this.loginAttemptsService.logAttempt({
        username,
        ip_address: ipAddress,
        user_agent: userAgent,
        success: false,
        failure_reason:
          error instanceof UnauthorizedException
            ? 'Credenciales incorrectas'
            : 'Error desconocido',
      });

      // Incrementar contador en BD
      await this.prisma.usuarios
        .update({
          where: { username },
          data: {
            intentos_fallidos: { increment: 1 },
          },
        })
        .catch(() => {
          // Usuario no existe, ignorar
        });

      throw error;
    }
  }

  register(registerDto: any) {
    throw new Error('Method not implemented.');
  }
}
