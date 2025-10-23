/* eslint-disable @typescript-eslint/no-unused-vars */
// backend/src/auth/guards/ws-jwt.guard.ts

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        throw new WsException('Token no proporcionado');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Agregar usuario al client para usarlo después
      client.data.user = payload;

      return true;
    } catch (error) {
      throw new WsException('Token inválido o expirado');
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    // Buscar token en handshake auth
    const token = client.handshake?.auth?.token;
    if (token) {
      return token;
    }

    // Buscar en headers
    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Buscar en query params
    const queryToken = client.handshake?.query?.token;
    if (typeof queryToken === 'string') {
      return queryToken;
    }

    return null;
  }
}
