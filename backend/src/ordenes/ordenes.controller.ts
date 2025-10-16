/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Request,
} from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CambiarEstadoOrdenDto } from './dto/cambiar-estado-orden.dto';
import { CambiarEstadoItemDto } from './dto/cambiar-estado-item.dto';
import { AplicarDescuentoDto } from './dto/aplicar-descuento.dto';
import { AplicarPropinaDto } from './dto/aplicar-propina.dto';
import { DividirCuentaDto } from './dto/dividir-cuenta.dto';
import { QueryOrdenesDto } from './dto/query-ordenes.dto';
import { AddMultipleItemsDto } from './dto/add-multiple-items.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Ordenes')
@ApiBearerAuth('JWT-auth')
@Controller('ordenes')
@UseGuards(JwtAuthGuard)
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva orden',
    description:
      'Crea una nueva orden asociada a una mesa y sesión activa. La orden se crea en estado "Pendiente" y lista para agregar items. Registra el mesero que la creó y la hora de apertura. Valida que la mesa tenga una sesión activa antes de crear la orden. Usado al iniciar el servicio de una mesa o al abrir una nueva cuenta.',
  })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Orden creada exitosamente',
        data: {
          id_orden: 456,
          id_sesion: 789,
          id_mesa: 12,
          numero_orden: 'ORD-2025-456',
          estado: 'Pendiente',
          total: 0,
          id_usuario_registra: 5,
          fecha_creacion: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o mesa sin sesión activa',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['La mesa no tiene una sesión activa'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado',
  })
  @ApiResponse({ status: 404, description: 'Mesa o sesión no encontrada' })
  async create(@Body() createOrdenDto: CreateOrdenDto, @Request() req) {
    const orden = await this.ordenesService.create(
      createOrdenDto,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Orden creada exitosamente',
      data: orden,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar órdenes con filtros',
    description:
      'Obtiene lista paginada de órdenes con múltiples filtros: por estado, mesa, sesión, mesero, rango de fechas. Incluye detalles de mesa, sesión y totales. Soporta ordenamiento y paginación. Usado para monitoreo de órdenes activas, historial y reportes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_orden: 456,
            numero_orden: 'ORD-2025-456',
            mesa: { numero: 12, nombre: 'Mesa 12' },
            estado: 'En proceso',
            total: 450.5,
            fecha_creacion: '2025-10-15T19:30:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(@Query() query: QueryOrdenesDto) {
    const result = await this.ordenesService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('pendientes')
  @ApiOperation({
    summary: 'Obtener órdenes pendientes de pago',
    description:
      'Lista todas las órdenes que están en estado "Servida" o "En proceso" y pendientes de pago completo. Incluye saldo pendiente calculado (total - pagado). Usado en punto de venta para identificar cuentas abiertas que requieren cobro.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes pendientes',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_orden: 456,
            mesa: { numero: 12 },
            total: 450.5,
            pagado: 0,
            saldo_pendiente: 450.5,
            tiempo_transcurrido: '30 minutos',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getPendientes() {
    const ordenes = await this.ordenesService.getOrdenesPendientes();
    return {
      success: true,
      data: ordenes,
    };
  }

  @Get('cocina')
  @ApiOperation({
    summary: 'Vista de órdenes para cocina',
    description:
      'Retorna órdenes agrupadas por prioridad para preparación en cocina. Incluye items en estados "Pendiente" y "En preparación" con tiempos de espera. Ordena por antigüedad para FIFO. Excluye items ya listos o cancelados. Usado en pantallas de cocina para gestión de preparación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Vista de cocina con órdenes activas',
    schema: {
      example: {
        success: true,
        data: {
          pendientes: [
            {
              id_orden: 456,
              mesa: 12,
              items: [
                {
                  producto: 'Hamburguesa Clásica',
                  cantidad: 2,
                  notas: 'Sin cebolla',
                  tiempo_espera: '5 min',
                },
              ],
            },
          ],
          en_preparacion: [],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getCocina() {
    const ordenes = await this.ordenesService.getOrdenesCocina();
    return {
      success: true,
      data: ordenes,
    };
  }

  @Get('por-servir')
  @ApiOperation({
    summary: 'Obtener items listos para servir',
    description:
      'Lista items de órdenes que están en estado "Listo" pendientes de ser servidos a la mesa. Agrupados por mesa/orden. Incluye tiempo desde que están listos. Usado por meseros para identificar platillos que deben llevarse a las mesas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Items listos para servir',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_orden: 456,
            mesa: 12,
            items_listos: [
              {
                id_item: 1234,
                producto: 'Hamburguesa Clásica',
                cantidad: 2,
                tiempo_listo: '3 min',
              },
            ],
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getPorServir() {
    const items = await this.ordenesService.getItemsPorServir();
    return {
      success: true,
      data: items,
    };
  }

  @Get('sesion/:sesionId')
  @ApiOperation({
    summary: 'Obtener órdenes de una sesión',
    description:
      'Lista todas las órdenes (activas, pagadas, canceladas) de una sesión específica de mesa. Incluye totales agregados y detalle completo de cada orden. Usado para ver historial completo de consumo de una mesa durante su sesión.',
  })
  @ApiParam({
    name: 'sesionId',
    description: 'ID de la sesión de mesa',
    example: 789,
  })
  @ApiResponse({
    status: 200,
    description: 'Órdenes de la sesión',
    schema: {
      example: {
        success: true,
        data: {
          sesion: { id: 789, mesa: 12 },
          ordenes: [
            {
              id_orden: 456,
              total: 450.5,
              estado: 'Pagada',
            },
          ],
          total_consumo: 450.5,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  async findBySesion(@Param('sesionId', ParseIntPipe) sesionId: number) {
    const ordenes = await this.ordenesService.findBySesion(sesionId);
    return {
      success: true,
      data: ordenes,
    };
  }

  @Get('mesa/:mesaId')
  @ApiOperation({
    summary: 'Obtener órdenes activas de una mesa',
    description:
      'Retorna órdenes activas (no pagadas ni canceladas) de la sesión actual de una mesa. Incluye items, totales y tiempos. Usado para consultar cuenta actual de una mesa ocupada.',
  })
  @ApiParam({
    name: 'mesaId',
    description: 'ID de la mesa',
    example: 12,
  })
  @ApiResponse({
    status: 200,
    description: 'Órdenes activas de la mesa',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_orden: 456,
            total: 450.5,
            items_count: 5,
            estado: 'En proceso',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Mesa no encontrada o sin sesión activa',
  })
  async findByMesa(@Param('mesaId', ParseIntPipe) mesaId: number) {
    const ordenes = await this.ordenesService.findByMesaActiva(mesaId);
    return {
      success: true,
      data: ordenes,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de una orden',
    description:
      'Retorna detalle completo de una orden: items con precios y estados, totales con descuentos/propinas, información de mesa/sesión, historial de cambios de estado, pagos aplicados. Usado para consulta detallada y auditoría.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle completo de la orden',
    schema: {
      example: {
        success: true,
        data: {
          id_orden: 456,
          numero_orden: 'ORD-2025-456',
          mesa: { numero: 12 },
          items: [
            {
              producto: 'Hamburguesa',
              cantidad: 2,
              precio_unitario: 120,
              subtotal: 240,
              estado: 'Servido',
            },
          ],
          subtotal: 450,
          descuento: 45,
          propina: 50,
          total: 455,
          pagos: [],
          saldo_pendiente: 455,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const orden = await this.ordenesService.findOne(id);
    return {
      success: true,
      data: orden,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar orden',
    description:
      'Modifica datos generales de una orden: notas, observaciones, número de comensales. No modifica items ni totales (usar endpoints específicos). Solo permite actualización de órdenes en estados editables.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Orden actualizada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Orden actualizada exitosamente',
        data: {
          id_orden: 456,
          notas: 'Cliente solicita servicio rápido',
          numero_comensales: 4,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede actualizar orden en este estado',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['No se puede actualizar una orden pagada o cancelada'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrdenDto: UpdateOrdenDto,
  ) {
    const orden = await this.ordenesService.update(id, updateOrdenDto);
    return {
      success: true,
      message: 'Orden actualizada exitosamente',
      data: orden,
    };
  }

  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de orden',
    description:
      'Actualiza el estado de una orden siguiendo el flujo: Pendiente → En proceso → Servida → Pagada. Valida transiciones permitidas y registra historial. Registra usuario y motivo del cambio. Estados: 1=Pendiente, 2=En proceso, 3=Servida, 4=Pagada, 8=Cancelada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Estado actualizado exitosamente',
        data: {
          id_orden: 456,
          estado_anterior: 'En proceso',
          estado_nuevo: 'Servida',
          actualizado_por: 'Juan Pérez',
          fecha_cambio: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado no permitida',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['No se puede cambiar de "Pagada" a "Pendiente"'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden o estado no encontrado' })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoOrdenDto,
    @Request() req,
  ) {
    const orden = await this.ordenesService.cambiarEstado(
      id,
      dto,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Estado actualizado exitosamente',
      data: orden,
    };
  }

  @Patch(':id/descuento')
  @ApiOperation({
    summary: 'Aplicar descuento a orden',
    description:
      'Aplica descuento a orden completa: por porcentaje (%) o monto fijo ($). Recalcula total automáticamente. Requiere autorización según política. Registra usuario que aplicó descuento y motivo. El descuento se refleja en el total final de la orden.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Descuento aplicado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Descuento aplicado exitosamente',
        data: {
          id_orden: 456,
          subtotal: 450,
          descuento: 45,
          tipo_descuento: 'porcentaje',
          porcentaje_descuento: 10,
          total_con_descuento: 405,
          autorizado_por: 'Gerente',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Descuento inválido o excede límites',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['El descuento no puede ser mayor al total de la orden'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos para aplicar este descuento',
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async aplicarDescuento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AplicarDescuentoDto,
  ) {
    const orden = await this.ordenesService.aplicarDescuento(id, dto);
    return {
      success: true,
      message: 'Descuento aplicado exitosamente',
      data: orden,
    };
  }

  @Patch(':id/propina')
  @ApiOperation({
    summary: 'Aplicar propina a orden',
    description:
      'Registra propina en orden: por porcentaje del subtotal o monto fijo. Puede ser propina sugerida o voluntaria del cliente. Se suma al total final. Propinas comunes: 10%, 15%, 20% del subtotal antes de descuentos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Propina aplicada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Propina aplicada exitosamente',
        data: {
          id_orden: 456,
          subtotal: 450,
          propina: 67.5,
          tipo_propina: 'porcentaje',
          porcentaje_propina: 15,
          total_con_propina: 517.5,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Propina inválida',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['La propina no puede ser negativa'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async aplicarPropina(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AplicarPropinaDto,
  ) {
    const orden = await this.ordenesService.aplicarPropina(id, dto);
    return {
      success: true,
      message: 'Propina aplicada exitosamente',
      data: orden,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancelar orden',
    description:
      'Cancela una orden cambiando su estado a "Cancelada" (id_estado=8). Requiere motivo obligatorio. Solo permite cancelar órdenes en estados tempranos (Pendiente, En proceso). Órdenes servidas o pagadas no pueden cancelarse. Libera items de inventario si aplica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a cancelar',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Orden cancelada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Orden cancelada exitosamente',
        data: {
          id_orden: 456,
          estado: 'Cancelada',
          motivo_cancelacion: 'Cancelada por usuario',
          cancelada_por: 'Juan Pérez',
          fecha_cancelacion: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede cancelar orden en este estado',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['No se puede cancelar una orden ya pagada'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const orden = await this.ordenesService.cambiarEstado(
      id,
      {
        id_estado_orden: 8,
        motivo: 'Cancelada por usuario',
      },
      req.user.userId,
    );
    return {
      success: true,
      message: 'Orden cancelada exitosamente',
      data: orden,
    };
  }

  // ========== ENDPOINTS DE ITEMS ==========

  @Post(':ordenId/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar item a orden',
    description:
      'Añade un item (producto) a una orden existente. Incluye cantidad, precio, notas especiales (modificadores, peticiones). Valida disponibilidad de producto e inventario. Recalcula total de orden. Estado inicial del item: "Pendiente". Usado al tomar orden de cliente.',
  })
  @ApiParam({
    name: 'ordenId',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 201,
    description: 'Item agregado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Item agregado exitosamente',
        data: {
          id_item: 1234,
          id_orden: 456,
          producto: 'Hamburguesa Clásica',
          cantidad: 2,
          precio_unitario: 120,
          subtotal: 240,
          notas: 'Sin cebolla',
          estado: 'Pendiente',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Producto no disponible o sin stock',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['Producto sin stock disponible'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden o producto no encontrado' })
  async addItem(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Body() addItemDto: AddItemDto,
  ) {
    const item = await this.ordenesService.addItem(ordenId, addItemDto);
    return {
      success: true,
      message: 'Item agregado exitosamente',
      data: item,
    };
  }

  @Post(':ordenId/items/multiple')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar múltiples items a orden',
    description:
      'Añade varios items en una sola petición. Optimiza proceso al tomar orden completa de cliente. Valida cada item individualmente. Si algún item falla, se detiene proceso y se notifica. Recalcula total una vez agregados todos. Usado al capturar orden completa de mesa.',
  })
  @ApiParam({
    name: 'ordenId',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 201,
    description: 'Items agregados exitosamente',
    schema: {
      example: {
        success: true,
        message: '3 items agregados exitosamente',
        data: [
          {
            id_item: 1234,
            producto: 'Hamburguesa',
            cantidad: 2,
            subtotal: 240,
          },
          {
            id_item: 1235,
            producto: 'Papas Fritas',
            cantidad: 2,
            subtotal: 80,
          },
          {
            id_item: 1236,
            producto: 'Refresco',
            cantidad: 3,
            subtotal: 60,
          },
        ],
        total_agregado: 380,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error en uno o más items',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['Item 2: Producto sin stock disponible'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async addMultipleItems(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Body() dto: AddMultipleItemsDto,
  ) {
    const items = await this.ordenesService.addMultipleItems(ordenId, dto);
    return {
      success: true,
      message: `${items.length} items agregados exitosamente`,
      data: items,
    };
  }

  @Get(':ordenId/items')
  @ApiOperation({
    summary: 'Listar items de una orden',
    description:
      'Retorna todos los items de una orden con detalles: producto, cantidad, precios, modificadores, estado de preparación. Incluye items cancelados marcados. Usado para mostrar detalle de consumo de mesa.',
  })
  @ApiParam({
    name: 'ordenId',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de items de la orden',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_item: 1234,
            producto: 'Hamburguesa Clásica',
            cantidad: 2,
            precio_unitario: 120,
            subtotal: 240,
            estado: 'En preparación',
            notas: 'Sin cebolla',
          },
          {
            id_item: 1235,
            producto: 'Papas Fritas',
            cantidad: 2,
            precio_unitario: 40,
            subtotal: 80,
            estado: 'Listo',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async getItems(@Param('ordenId', ParseIntPipe) ordenId: number) {
    const orden = await this.ordenesService.findOne(ordenId);
    return {
      success: true,
      data: orden.orden_detalle,
    };
  }

  @Patch(':ordenId/items/:itemId')
  @ApiOperation({
    summary: 'Actualizar item de orden',
    description:
      'Modifica item existente: cantidad, notas/modificadores, precio (con autorización). Solo permite edición antes de preparación. Recalcula subtotal y total de orden. Usado para correcciones de orden antes de enviar a cocina.',
  })
  @ApiParam({
    name: 'ordenId',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID del item a actualizar',
    example: 1234,
  })
  @ApiResponse({
    status: 200,
    description: 'Item actualizado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Item actualizado exitosamente',
        data: {
          id_item: 1234,
          cantidad: 3,
          notas: 'Sin cebolla, sin tomate',
          subtotal: 360,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede actualizar item en este estado',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['No se puede modificar un item ya servido'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden o item no encontrado' })
  async updateItem(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    const item = await this.ordenesService.updateItem(
      ordenId,
      itemId,
      updateItemDto,
    );
    return {
      success: true,
      message: 'Item actualizado exitosamente',
      data: item,
    };
  }

  @Patch(':ordenId/items/:itemId/estado')
  @ApiOperation({
    summary: 'Cambiar estado de item',
    description:
      'Actualiza estado de item en flujo de preparación: Pendiente → En preparación → Listo → Servido. Usado por cocina para marcar progreso. Notifica a meseros cuando items están listos. Estados: 1=Pendiente, 2=En preparación, 3=Listo, 4=Servido, 5=Cancelado.',
  })
  @ApiParam({
    name: 'ordenId',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID del item',
    example: 1234,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del item actualizado',
    schema: {
      example: {
        success: true,
        message: 'Estado del item actualizado',
        data: {
          id_item: 1234,
          producto: 'Hamburguesa Clásica',
          estado_anterior: 'En preparación',
          estado_nuevo: 'Listo',
          tiempo_preparacion: '12 minutos',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado no permitida',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['No se puede cambiar de "Servido" a "Pendiente"'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Item o estado no encontrado' })
  async cambiarEstadoItem(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CambiarEstadoItemDto,
  ) {
    const item = await this.ordenesService.cambiarEstadoItem(
      ordenId,
      itemId,
      dto,
    );
    return {
      success: true,
      message: 'Estado del item actualizado',
      data: item,
    };
  }

  @Delete(':ordenId/items/:itemId')
  @ApiOperation({
    summary: 'Eliminar item de orden',
    description:
      'Cancela/elimina item de orden. Si item no ha iniciado preparación, se elimina físicamente. Si ya está en preparación, se marca como cancelado. Recalcula total de orden. Requiere motivo. Puede generar cargo según política del negocio.',
  })
  @ApiParam({
    name: 'ordenId',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiParam({
    name: 'itemId',
    description: 'ID del item a eliminar',
    example: 1234,
  })
  @ApiResponse({
    status: 200,
    description: 'Item eliminado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Item cancelado exitosamente',
        data: {
          id_item: 1234,
          accion: 'cancelado',
          orden_actualizada: {
            total_anterior: 450,
            total_nuevo: 210,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar item en este estado',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['No se puede eliminar un item ya servido'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden o item no encontrado' })
  async removeItem(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    const result = await this.ordenesService.removeItem(ordenId, itemId);
    return {
      success: true,
      ...result,
    };
  }
}
