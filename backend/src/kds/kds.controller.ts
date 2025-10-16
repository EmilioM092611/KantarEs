import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KdsService } from './kds.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('KDS - Kitchen Display System')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kds')
export class KdsController {
  constructor(private readonly kds: KdsService) {}

  @Get('tickets')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({
    summary: 'Listar tickets de cocina/barra con filtros opcionales',
    description:
      'Lista tickets de preparación para pantallas de cocina/barra (Kitchen Display System). Muestra órdenes activas con items pendientes de preparar o en preparación. Filtros: por estación (cocina fría/caliente/barra), estado (pendiente/en_preparación/listo), prioridad (urgente/normal), mesa, tiempo de espera. Ordena por antigüedad (FIFO) o prioridad. Incluye timer de cada item, notas especiales del cliente (sin cebolla, término de carne, etc.), alérgenos. Actualización en tiempo real vía WebSocket. Usado en pantallas de cocina para gestionar flujo de preparación. CRÍTICO para eficiencia operativa y tiempos de servicio.',
  })
  @ApiQuery({
    name: 'estacion',
    required: false,
    description: 'Filtrar por estación de trabajo',
    enum: ['cocina_fria', 'cocina_caliente', 'parrilla', 'barra', 'postres'],
    example: 'cocina_caliente',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado de preparación',
    enum: ['pendiente', 'en_preparacion', 'listo', 'servido'],
    example: 'pendiente',
  })
  @ApiQuery({
    name: 'prioridad',
    required: false,
    description: 'Filtrar por prioridad',
    enum: ['urgente', 'alta', 'normal', 'baja'],
    example: 'urgente',
  })
  @ApiQuery({
    name: 'mesa',
    required: false,
    description: 'Filtrar por número de mesa',
    type: Number,
    example: 12,
  })
  @ApiQuery({
    name: 'tiempo_espera_min',
    required: false,
    description: 'Filtrar items con tiempo de espera mayor a X minutos',
    type: Number,
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tickets obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          tickets_activos: 12,
          items_pendientes: 45,
          tiempo_promedio_espera: '8 minutos',
          tickets: [
            {
              id_ticket: 1001,
              orden: {
                id: 456,
                numero: 'ORD-2025-456',
                mesa: 12,
                mesero: 'Juan Pérez',
              },
              estacion: 'cocina_caliente',
              prioridad: 'urgente',
              tiempo_espera: '12 minutos',
              alerta_tiempo: true,
              items: [
                {
                  id_item: 1234,
                  producto: 'Hamburguesa Clásica',
                  cantidad: 2,
                  estado: 'pendiente',
                  notas: 'Sin cebolla, término 3/4',
                  alergenos: ['gluten'],
                  tiempo_preparacion_estimado: '10 min',
                  timer_iniciado: null,
                },
                {
                  id_item: 1235,
                  producto: 'Papas Fritas',
                  cantidad: 2,
                  estado: 'en_preparacion',
                  notas: 'Extra crujientes',
                  timer_iniciado: '2025-10-15T20:05:00.000Z',
                  tiempo_transcurrido: '3 min',
                  tiempo_restante: '2 min',
                },
              ],
              hora_ingreso: '2025-10-15T20:00:00.000Z',
              completado_parcial: '50%',
            },
            {
              id_ticket: 1002,
              orden: {
                id: 457,
                numero: 'ORD-2025-457',
                mesa: 8,
                mesero: 'María González',
              },
              estacion: 'barra',
              prioridad: 'normal',
              tiempo_espera: '5 minutos',
              alerta_tiempo: false,
              items: [
                {
                  id_item: 1240,
                  producto: 'Margarita',
                  cantidad: 2,
                  estado: 'pendiente',
                  notas: 'Con sal en el borde',
                  tiempo_preparacion_estimado: '3 min',
                },
              ],
              hora_ingreso: '2025-10-15T20:07:00.000Z',
              completado_parcial: '0%',
            },
          ],
          alertas: [
            {
              tipo: 'tiempo_excedido',
              mensaje: 'Mesa 12 esperando más de 10 minutos',
              ticket_id: 1001,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Rol insuficiente para acceder a KDS',
  })
  listarTickets(@Query() q: any) {
    return this.kds.listarTickets(q);
  }

  @Patch('items/:id/estado')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({
    summary:
      'Actualizar el estado de un ítem del ticket (pendiente/en_preparacion/listo)',
    description:
      'Actualiza estado de preparación de un item individual en el sistema KDS. Flujo: pendiente → en_preparación (inicia timer) → listo (detiene timer, notifica mesero) → servido (marcado por mesero). Registra timestamps de cada transición. Calcula tiempo real de preparación. Genera métricas de desempeño de cocina. Notificaciones: avisa a mesero cuando item está listo via app/pantalla. Validaciones: no saltar estados, requiere estar en estación correcta. Usado por cocineros al trabajar en pantallas KDS. Crítico para coordinación cocina-servicio.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del item de orden a actualizar',
    example: 1234,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del item actualizado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Estado actualizado exitosamente',
        data: {
          id_item: 1234,
          producto: 'Hamburguesa Clásica',
          estado_anterior: 'pendiente',
          estado_nuevo: 'en_preparacion',
          orden: {
            id: 456,
            mesa: 12,
          },
          timestamps: {
            hora_pedido: '2025-10-15T20:00:00.000Z',
            hora_inicio_preparacion: '2025-10-15T20:02:00.000Z',
            tiempo_espera_inicio: '2 minutos',
          },
          timer: {
            iniciado: true,
            hora_inicio: '2025-10-15T20:02:00.000Z',
            tiempo_estimado: '10 minutos',
            hora_estimada_finalizacion: '2025-10-15T20:12:00.000Z',
          },
          cocinero: {
            id: 8,
            nombre: 'Roberto Chef',
          },
          siguiente_accion: 'Marcar como "listo" cuando termine la preparación',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado no válida',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'No se puede cambiar de "pendiente" a "listo" sin pasar por "en_preparacion"',
          'El item ya está en estado "servido" y no puede modificarse',
        ],
        data: {
          estado_actual: 'pendiente',
          estado_solicitado: 'listo',
          transiciones_validas: ['en_preparacion'],
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Rol insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Item no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Item con ID 9999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con estado de orden o estación',
    schema: {
      example: {
        success: false,
        code: 409,
        message: ['La orden está cancelada y no permite cambios en items'],
        data: {
          orden_id: 456,
          orden_estado: 'Cancelada',
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  actualizarEstadoItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.kds.actualizarEstadoItem(id, dto);
  }

  @Patch('tickets/:id/listo')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({
    summary: 'Marcar todos los ítems del ticket como listos',
    description:
      'Marca todos los items de un ticket (orden) como "listo" de una sola vez. Acción rápida cuando todos los platillos de una orden están terminados simultáneamente. Valida que todos los items estén en estado que permita cambio (pendiente o en_preparación). Detiene timers de todos los items. Registra hora de finalización. Notifica a mesero que toda la orden está lista para servir. Calcula tiempo total de preparación del ticket. Genera alerta de "recoger" en pantalla de meseros. Usado para agilizar marcado cuando varios items salen juntos de cocina.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden/ticket',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Todos los items marcados como listos exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Ticket completo marcado como listo',
        data: {
          id_orden: 456,
          numero_orden: 'ORD-2025-456',
          mesa: 12,
          items_actualizados: 5,
          items: [
            {
              id_item: 1234,
              producto: 'Hamburguesa Clásica',
              cantidad: 2,
              estado_anterior: 'en_preparacion',
              estado_nuevo: 'listo',
              tiempo_preparacion: '8 minutos',
            },
            {
              id_item: 1235,
              producto: 'Papas Fritas',
              cantidad: 2,
              estado_anterior: 'en_preparacion',
              estado_nuevo: 'listo',
              tiempo_preparacion: '5 minutos',
            },
            {
              id_item: 1236,
              producto: 'Refresco',
              cantidad: 3,
              estado_anterior: 'pendiente',
              estado_nuevo: 'listo',
              tiempo_preparacion: '1 minuto',
            },
          ],
          resumen: {
            tiempo_total_preparacion: '12 minutos',
            tiempo_desde_pedido: '15 minutos',
            hora_listo: '2025-10-15T20:15:00.000Z',
            dentro_tiempo_objetivo: true,
          },
          notificacion: {
            mesero_notificado: true,
            mesero: 'Juan Pérez',
            mensaje: 'Mesa 12 lista para servir (5 items)',
          },
          cocinero: {
            id: 8,
            nombre: 'Roberto Chef',
          },
          siguiente_paso: 'Esperando que mesero recoja y sirva',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No todos los items pueden marcarse como listos',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'No se puede marcar como listo: 2 items ya están servidos',
          'No se puede marcar como listo: el ticket tiene items cancelados',
        ],
        data: {
          items_servidos: [1237, 1238],
          items_cancelados: [1239],
          items_validos: [1234, 1235, 1236],
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Rol insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden/ticket no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Orden con ID 999 no encontrada'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con estado de orden',
    schema: {
      example: {
        success: false,
        code: 409,
        message: ['La orden está cancelada'],
        data: {
          orden_id: 456,
          estado: 'Cancelada',
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  marcarTicketListo(@Param('id', ParseIntPipe) id: number) {
    return this.kds.marcarTicketListo(id);
  }
}
