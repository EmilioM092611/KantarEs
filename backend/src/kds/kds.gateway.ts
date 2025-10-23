// backend/src/kds/kds.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { KdsService } from './kds.service';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  namespace: 'kds',
  cors: {
    origin: '*',
  },
})
export class KdsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(KdsGateway.name);
  private clientesConectados = new Map<string, any>();

  constructor(private kdsService: KdsService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente KDS conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente KDS desconectado: ${client.id}`);
    this.clientesConectados.delete(client.id);
  }

  /**
   * Cliente se suscribe a una estación específica
   */
  @SubscribeMessage('suscribir_estacion')
  async suscribirEstacion(
    @MessageBody() data: { id_estacion: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `estacion_${data.id_estacion}`;
    client.join(room);

    this.clientesConectados.set(client.id, {
      id_estacion: data.id_estacion,
      room,
    });

    this.logger.log(`Cliente ${client.id} suscrito a ${room}`);

    // Enviar estado inicial
    const tickets = await this.kdsService.listarTickets({
      estacion: data.id_estacion,
    });

    client.emit('estado_inicial', tickets);

    return { success: true, room };
  }

  /**
   * Cliente solicita actualización de tickets
   */
  @SubscribeMessage('solicitar_tickets')
  async solicitarTickets(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const tickets = await this.kdsService.listarTickets(data);
    client.emit('tickets_actualizados', tickets);
    return { success: true };
  }

  /**
   * Cambiar estado de item (con broadcast)
   */
  @SubscribeMessage('cambiar_estado')
  @UseGuards(WsJwtGuard)
  async cambiarEstado(
    @MessageBody()
    data: { id_kds_item: number; estado: string; id_usuario?: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const item = await this.kdsService.cambiarEstadoItem(data.id_kds_item, {
        estado: data.estado as any,
        id_usuario_prepara: data.id_usuario,
      });

      // Broadcast a todos los clientes de la estación
      const clientData = this.clientesConectados.get(client.id);
      if (clientData) {
        this.server.to(clientData.room).emit('item_actualizado', {
          id_kds_item: data.id_kds_item,
          estado: data.estado,
          item,
        });
      }

      return { success: true, item };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cambiar prioridad de item
   */
  @SubscribeMessage('cambiar_prioridad')
  @UseGuards(WsJwtGuard)
  async cambiarPrioridad(
    @MessageBody() data: { id_kds_item: number; prioridad: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const item = await this.kdsService.cambiarPrioridad(data.id_kds_item, {
        prioridad: data.prioridad,
      });

      // Broadcast
      const clientData = this.clientesConectados.get(client.id);
      if (clientData) {
        this.server.to(clientData.room).emit('prioridad_actualizada', {
          id_kds_item: data.id_kds_item,
          prioridad: data.prioridad,
        });
      }

      return { success: true, item };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Marcar item como requiere atención
   */
  @SubscribeMessage('marcar_atencion')
  async marcarAtencion(
    @MessageBody() data: { id_kds_item: number; requiere: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.kdsService.marcarRequiereAtencion(
        data.id_kds_item,
        data.requiere,
      );

      // Broadcast
      const clientData = this.clientesConectados.get(client.id);
      if (clientData) {
        this.server.to(clientData.room).emit('atencion_marcada', {
          id_kds_item: data.id_kds_item,
          requiere: data.requiere,
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Notificar nuevo item a todas las estaciones relevantes
   */
  async notificarNuevoItem(id_kds_item: number, id_estacion: number) {
    const room = `estacion_${id_estacion}`;

    const item = await this.kdsService.obtenerItemPorId(id_kds_item);

    this.server.to(room).emit('nuevo_item', {
      id_kds_item,
      item,
    });

    this.logger.log(`Nuevo item ${id_kds_item} notificado a ${room}`);
  }

  /**
   * Notificar alerta de tiempo excedido
   */
  notificarAlertaTiempo(id_kds_item: number, id_estacion: number) {
    const room = `estacion_${id_estacion}`;

    this.server.to(room).emit('alerta_tiempo', {
      id_kds_item,
      mensaje: 'Tiempo de preparación excedido',
    });

    this.logger.warn(`Alerta de tiempo para item ${id_kds_item} en ${room}`);
  }

  /**
   * Broadcast general a todas las estaciones
   */
  async broadcastActualizacion() {
    const estaciones = await this.kdsService.obtenerEstaciones(true);

    for (const estacion of estaciones) {
      const room = `estacion_${estacion.id_estacion}`;
      const tickets = await this.kdsService.listarTickets({
        estacion: estacion.id_estacion,
      });

      this.server.to(room).emit('tickets_actualizados', tickets);
    }
  }
}
