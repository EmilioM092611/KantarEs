// backend/src/notificaciones/guards/ws-jwt.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Token no proporcionado');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Agregar usuario al socket para uso posterior
      client.data.user = payload;

      return true;
    } catch (error) {
      this.logger.error(`Error en autenticación WebSocket: ${error.message}`);
      throw new WsException('Token inválido o expirado');
    }
  }

  private extractToken(client: Socket): string | null {
    // Intentar obtener token de diferentes formas
    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader) {
      return authHeader.replace('Bearer ', '');
    }

    const tokenQuery = client.handshake?.query?.token;
    if (tokenQuery) {
      return Array.isArray(tokenQuery) ? tokenQuery[0] : tokenQuery;
    }

    const tokenAuth = client.handshake?.auth?.token;
    if (tokenAuth) {
      return tokenAuth;
    }

    return null;
  }
}
