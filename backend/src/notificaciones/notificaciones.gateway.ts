/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// backend/src/notificaciones/notificaciones.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import {
  CanalNotificacion,
  UsuarioConectado,
} from './interfaces/notification.interface';
import {
  SendNotificationDto,
  EnviarChatDto,
} from './dto/send-notification.dto';

@WebSocketGateway({
  cors: {
    origin: '*', // En producción, especificar dominios permitidos
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificacionesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificacionesGateway.name);
  private usuariosConectados: Map<string, UsuarioConectado> = new Map();

  constructor(private readonly notificacionesService: NotificacionesService) {}

  // ==================== LIFECYCLE ====================

  async handleConnection(client: Socket) {
    try {
      const user = client.data.user;

      if (!user) {
        this.logger.warn(`Conexión rechazada: sin autenticación`);
        client.disconnect();
        return;
      }

      const usuarioConectado: UsuarioConectado = {
        id_usuario: user.id_usuario,
        username: user.username,
        rol: user.rol,
        socketId: client.id,
        conectado_desde: new Date(),
      };

      this.usuariosConectados.set(client.id, usuarioConectado);

      // Unir al usuario a su room de rol
      const room = this.getRoomPorRol(user.rol);
      await client.join(room);
      await client.join(`user:${user.id_usuario}`); // Room personal

      this.logger.log(
        `Usuario conectado: ${user.username} (${user.rol}) - Socket: ${client.id}`,
      );

      // Notificar al usuario que está conectado
      client.emit('conexion:exitosa', {
        usuario: usuarioConectado,
        rooms: Array.from(client.rooms),
      });

      // Enviar notificaciones no leídas
      const noLeidas = await this.notificacionesService.obtenerNoLeidas(
        user.id_usuario,
      );
      client.emit('notificaciones:pendientes', noLeidas);

      // Notificar a admins sobre nueva conexión
      this.server.to(CanalNotificacion.ADMIN).emit('usuario:conectado', {
        usuario: usuarioConectado,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error en conexión: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const usuario = this.usuariosConectados.get(client.id);

    if (usuario) {
      this.logger.log(`Usuario desconectado: ${usuario.username}`);
      this.usuariosConectados.delete(client.id);

      // Notificar a admins
      this.server.to(CanalNotificacion.ADMIN).emit('usuario:desconectado', {
        usuario,
        timestamp: new Date(),
      });
    }
  }

  // ==================== MENSAJES ====================

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('enviar:notificacion')
  async handleEnviarNotificacion(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendNotificationDto,
  ) {
    try {
      const user = client.data.user;
      dto.id_usuario_origen = user.id_usuario;

      const notificacion = await this.notificacionesService.enviar(dto);

      // Emitir a los destinatarios
      this.emitirNotificacion(notificacion);

      return {
        success: true,
        data: notificacion,
      };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('marcar:leida')
  async handleMarcarLeida(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id_notificacion: number },
  ) {
    try {
      const user = client.data.user;
      await this.notificacionesService.marcarLeida(
        data.id_notificacion,
        user.id_usuario,
      );

      return {
        success: true,
        message: 'Notificación marcada como leída',
      };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chat:mensaje')
  async handleChatMensaje(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: EnviarChatDto,
  ) {
    try {
      const user = client.data.user;

      const notificacion = await this.notificacionesService.enviarChat(
        user.id_usuario,
        dto.mensaje,
        dto.id_usuario_destinatario,
      );

      // Emitir a destinatarios
      if (dto.id_usuario_destinatario) {
        this.server
          .to(`user:${dto.id_usuario_destinatario}`)
          .emit('chat:nuevo_mensaje', notificacion);
      } else {
        this.server.emit('chat:nuevo_mensaje', notificacion);
      }

      return {
        success: true,
        data: notificacion,
      };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('obtener:usuarios_conectados')
  handleObtenerUsuariosConectados(@ConnectedSocket() client: Socket) {
    const user = client.data.user;

    // Solo admins pueden ver todos los usuarios conectados
    if (user.rol !== 'Administrador' && user.rol !== 'Gerente') {
      throw new WsException('No autorizado');
    }

    const usuarios = Array.from(this.usuariosConectados.values());
    return {
      success: true,
      data: usuarios,
      total: usuarios.length,
    };
  }

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Emitir notificación a los destinatarios apropiados
   */
  emitirNotificacion(notificacion: any) {
    const { canal, id_usuario_destinatario, tipo } = notificacion;

    // Si es para un usuario específico
    if (id_usuario_destinatario) {
      this.server
        .to(`user:${id_usuario_destinatario}`)
        .emit('notificacion:nueva', notificacion);
    }
    // Si es broadcast
    else if (canal === CanalNotificacion.BROADCAST) {
      this.server.emit('notificacion:nueva', notificacion);
    }
    // Si es para un canal específico
    else {
      this.server.to(canal).emit('notificacion:nueva', notificacion);
    }

    this.logger.debug(
      `Notificación emitida: ${tipo} → Canal: ${canal || 'user:' + id_usuario_destinatario}`,
    );
  }

  /**
   * Emitir mensaje a un canal específico
   */
  emitirACanal(canal: CanalNotificacion, evento: string, data: any) {
    this.server.to(canal).emit(evento, data);
  }

  /**
   * Emitir mensaje a usuario específico
   */
  emitirAUsuario(id_usuario: number, evento: string, data: any) {
    this.server.to(`user:${id_usuario}`).emit(evento, data);
  }

  /**
   * Broadcast a todos los conectados
   */
  broadcast(evento: string, data: any) {
    this.server.emit(evento, data);
  }

  // ==================== HELPERS ====================

  private getRoomPorRol(rol: string): CanalNotificacion {
    const rolesMap = {
      Administrador: CanalNotificacion.ADMIN,
      Gerente: CanalNotificacion.ADMIN,
      Cajero: CanalNotificacion.CAJA,
      Mesero: CanalNotificacion.MESEROS,
      Cocinero: CanalNotificacion.COCINA,
      Bartender: CanalNotificacion.COCINA,
    };

    return rolesMap[rol] || CanalNotificacion.BROADCAST;
  }

  getUsuariosConectados(): UsuarioConectado[] {
    return Array.from(this.usuariosConectados.values());
  }

  getTotalConectados(): number {
    return this.usuariosConectados.size;
  }
}
