/* eslint-disable @typescript-eslint/no-unsafe-argument */
// backend/src/notificaciones/notificaciones.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesGateway } from './notificaciones.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  SendNotificationDto,
  EnviarChatDto,
} from './dto/send-notification.dto';

@ApiTags('Notificaciones en Tiempo Real')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(
    private readonly notificacionesService: NotificacionesService,
    private readonly notificacionesGateway: NotificacionesGateway,
  ) {}

  // ==================== ENVÍO DE NOTIFICACIONES ====================

  @Post('enviar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Enviar notificación (REST)',
    description:
      'Envía una notificación y la emite en tiempo real vía WebSocket. Útil para integraciones y sistemas externos.',
  })
  @ApiResponse({
    status: 201,
    description: 'Notificación enviada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Notificación enviada exitosamente',
        data: {
          id_notificacion: 12345,
          tipo: 'orden.nueva',
          titulo: 'Nueva orden',
          mensaje: 'Mesa 5 - 3 items',
          canal: 'cocina',
          fecha_hora: '2025-10-20T20:00:00.000Z',
        },
      },
    },
  })
  async enviarNotificacion(@Body() dto: SendNotificationDto, @Req() req: any) {
    dto.id_usuario_origen = req.user.id_usuario;

    const notificacion = await this.notificacionesService.enviar(dto);

    // Emitir vía WebSocket
    this.notificacionesGateway.emitirNotificacion(notificacion);

    return {
      success: true,
      message: 'Notificación enviada exitosamente',
      data: notificacion,
    };
  }

  @Post('chat')
  @ApiOperation({ summary: 'Enviar mensaje de chat interno' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado' })
  async enviarChat(@Body() dto: EnviarChatDto, @Req() req: any) {
    const notificacion = await this.notificacionesService.enviarChat(
      req.user.id_usuario,
      dto.mensaje,
      dto.id_usuario_destinatario,
    );

    // Emitir vía WebSocket
    if (dto.id_usuario_destinatario) {
      this.notificacionesGateway.emitirAUsuario(
        dto.id_usuario_destinatario,
        'chat:nuevo_mensaje',
        notificacion,
      );
    } else {
      this.notificacionesGateway.broadcast('chat:nuevo_mensaje', notificacion);
    }

    return {
      success: true,
      message: 'Mensaje enviado',
      data: notificacion,
    };
  }

  // ==================== CONSULTAS ====================

  @Get('mis-notificaciones')
  @ApiOperation({
    summary: 'Obtener mis notificaciones',
    description: 'Retorna las notificaciones del usuario autenticado',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 50,
    description: 'Número de notificaciones a obtener',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 0,
    description: 'Desplazamiento para paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones obtenidas',
  })
  async obtenerMisNotificaciones(
    @Req() req: any,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    const notificaciones = await this.notificacionesService.obtenerPorUsuario(
      req.user.id_usuario,
      limit,
      offset,
    );

    return {
      success: true,
      data: notificaciones,
      total: notificaciones.length,
    };
  }

  @Get('no-leidas')
  @ApiOperation({ summary: 'Obtener notificaciones no leídas' })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones no leídas obtenidas',
  })
  async obtenerNoLeidas(@Req() req: any, @Query('limit') limit: number = 50) {
    const notificaciones = await this.notificacionesService.obtenerNoLeidas(
      req.user.id_usuario,
      limit,
    );

    return {
      success: true,
      data: notificaciones,
      total: notificaciones.length,
    };
  }

  @Post(':id/marcar-leida')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 200,
    description: 'Notificación marcada como leída',
  })
  async marcarLeida(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.notificacionesService.marcarLeida(id, req.user.id_usuario);

    return {
      success: true,
      message: 'Notificación marcada como leída',
    };
  }

  @Post('marcar-todas-leidas')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({
    status: 200,
    description: 'Todas las notificaciones marcadas como leídas',
  })
  async marcarTodasLeidas(@Req() req: any) {
    const resultado = await this.notificacionesService.marcarTodasLeidas(
      req.user.id_usuario,
    );

    return {
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      data: resultado,
    };
  }

  // ==================== ESTADÍSTICAS ====================

  @Get('estadisticas')
  @ApiOperation({
    summary: 'Obtener estadísticas de notificaciones',
    description: 'Total, no leídas, distribución por tipo y canal',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas',
  })
  async obtenerEstadisticas(@Req() req: any) {
    const stats = await this.notificacionesService.obtenerEstadisticas(
      req.user.id_usuario,
    );

    return {
      success: true,
      data: stats,
    };
  }

  @Get('estadisticas/sistema')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Estadísticas generales del sistema (Admin)',
    description: 'Estadísticas globales de todas las notificaciones',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del sistema obtenidas',
  })
  async obtenerEstadisticasSistema() {
    const stats = await this.notificacionesService.obtenerEstadisticas();

    return {
      success: true,
      data: stats,
    };
  }

  // ==================== USUARIOS CONECTADOS ====================

  @Get('usuarios-conectados')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener usuarios conectados vía WebSocket',
    description: 'Lista de todos los usuarios actualmente conectados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios conectados',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_usuario: 5,
            username: 'juan_mesero',
            rol: 'Mesero',
            socketId: 'abc123xyz',
            conectado_desde: '2025-10-20T19:30:00.000Z',
          },
        ],
        total: 5,
      },
    },
  })
  obtenerUsuariosConectados() {
    const usuarios = this.notificacionesGateway.getUsuariosConectados();

    return {
      success: true,
      data: usuarios,
      total: usuarios.length,
    };
  }

  // ==================== LIMPIEZA ====================

  @Delete('limpiar-expiradas')
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Limpiar notificaciones expiradas',
    description: 'Elimina notificaciones que ya expiraron',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones expiradas eliminadas',
  })
  async limpiarExpiradas() {
    const resultado = await this.notificacionesService.limpiarExpiradas();

    return {
      success: true,
      message: `${resultado.count} notificaciones expiradas eliminadas`,
      data: resultado,
    };
  }

  @Delete('limpiar-antiguas')
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Limpiar notificaciones leídas antiguas',
    description: 'Elimina notificaciones leídas con más de X días',
  })
  @ApiQuery({
    name: 'dias',
    required: false,
    example: 30,
    description: 'Días de antigüedad',
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones antiguas eliminadas',
  })
  async limpiarAntiguas(@Query('dias') dias: number = 30) {
    const resultado =
      await this.notificacionesService.limpiarAntiguasLeidas(dias);

    return {
      success: true,
      message: `${resultado.count} notificaciones antiguas eliminadas`,
      data: resultado,
    };
  }
}
