/* eslint-disable @typescript-eslint/no-unsafe-argument */
// ============== orden-detalle.controller.ts ==============
import {
  Controller,
  Get,
  Param,
  Query,
  Patch,
  Body,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { OrdenDetalleService } from './orden-detalle.service';
import { QueryItemsDto } from './dto/query-items.dto';
import { BatchUpdateEstadoDto } from './dto/batch-update-estado.dto';
import { EstadisticasCocinaDto } from './dto/estadisticas-cocina.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Orden-detalle')
@ApiBearerAuth('JWT-auth')
@Controller('orden-detalle')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdenDetalleController {
  constructor(private readonly ordenDetalleService: OrdenDetalleService) {}

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero', 'Cocinero')
  @ApiOperation({
    summary: 'Listar todos los items con filtros',
    description:
      'Lista items de todas las órdenes con filtros avanzados: por estado de preparación, orden específica, producto, rango de fechas, área de preparación (cocina/barra). Incluye detalles de producto, orden asociada, mesa, precios, estado actual, tiempos. Soporta paginación y ordenamiento. Usado para consultas generales, reportes de items, análisis de productos más vendidos, seguimiento de preparación.',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado de preparación',
    enum: ['pendiente', 'en_preparacion', 'listo', 'servido', 'cancelado'],
    example: 'pendiente',
  })
  @ApiQuery({
    name: 'id_orden',
    required: false,
    description: 'Filtrar por orden específica',
    type: Number,
    example: 456,
  })
  @ApiQuery({
    name: 'id_producto',
    required: false,
    description: 'Filtrar por producto específico',
    type: Number,
    example: 12,
  })
  @ApiQuery({
    name: 'fecha_desde',
    required: false,
    description: 'Fecha inicio del rango (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'fecha_hasta',
    required: false,
    description: 'Fecha fin del rango (YYYY-MM-DD)',
    example: '2025-10-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de items obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_item: 1234,
            orden: {
              id: 456,
              numero: 'ORD-2025-456',
              mesa: 12,
            },
            producto: {
              id: 12,
              nombre: 'Hamburguesa Clásica',
              sku: 'FOOD-001',
            },
            cantidad: 2,
            precio_unitario: 120.0,
            subtotal: 240.0,
            estado: 'en_preparacion',
            notas: 'Sin cebolla',
            fecha_creacion: '2025-10-15T20:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado',
  })
  async findAll(@Query() query: QueryItemsDto) {
    const result = await this.ordenDetalleService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('cocina')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({
    summary: 'Vista de cocina general',
    description:
      'Vista optimizada para pantallas de cocina/barra. Lista items pendientes y en preparación filtrados por área (cocina o barra). Ordenados por prioridad y tiempo de espera (FIFO). Incluye: orden, mesa, producto, cantidad, notas especiales, tiempo transcurrido, prioridad. Formato optimizado para visualización en KDS. Excluye items ya servidos. Opcionalmente filtra por área específica. Actualización frecuente recomendada (polling/websocket).',
  })
  @ApiQuery({
    name: 'area',
    required: false,
    description: 'Filtrar por área de preparación específica',
    enum: ['cocina', 'barra'],
    example: 'cocina',
  })
  @ApiResponse({
    status: 200,
    description: 'Vista de cocina generada exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          items_activos: 45,
          areas: {
            cocina: {
              pendientes: 18,
              en_preparacion: 12,
              items: [
                {
                  id_item: 1234,
                  orden: 'ORD-2025-456',
                  mesa: 12,
                  producto: 'Hamburguesa Clásica',
                  cantidad: 2,
                  estado: 'pendiente',
                  notas: 'Sin cebolla, término 3/4',
                  tiempo_espera: '8 minutos',
                  prioridad: 'normal',
                },
              ],
            },
            barra: {
              pendientes: 8,
              en_preparacion: 7,
              items: [
                {
                  id_item: 1240,
                  orden: 'ORD-2025-457',
                  mesa: 8,
                  producto: 'Margarita',
                  cantidad: 2,
                  estado: 'en_preparacion',
                  tiempo_espera: '3 minutos',
                },
              ],
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getCocina(@Query('area') area?: 'cocina' | 'barra') {
    const items = await this.ordenDetalleService.getCocinaView(area);
    return {
      success: true,
      data: items,
    };
  }

  @Get('prioritarios')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({
    summary: 'Items prioritarios por tiempo de espera',
    description:
      'Lista items que requieren atención urgente por tiempo de espera excedido. Criterios: items pendientes o en preparación con tiempo > umbral configurado (ej: 15 min). Ordenados por antigüedad descendente (más antiguos primero). Incluye alertas de prioridad. Usado para identificar órdenes retrasadas, evitar quejas, gestionar picos de demanda. Típicamente mostrado con alerta visual roja en KDS.',
  })
  @ApiResponse({
    status: 200,
    description: 'Items prioritarios obtenidos exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          items_prioritarios: 3,
          umbral_minutos: 15,
          items: [
            {
              id_item: 1234,
              orden: {
                id: 456,
                numero: 'ORD-2025-456',
                mesa: 12,
              },
              producto: 'Hamburguesa Clásica',
              cantidad: 2,
              estado: 'pendiente',
              tiempo_espera: '22 minutos',
              exceso_tiempo: '7 minutos',
              prioridad: 'urgente',
              alerta: {
                nivel: 'critico',
                mensaje: 'Orden retrasada - Cliente puede estar molesto',
              },
            },
            {
              id_item: 1230,
              orden: {
                id: 450,
                numero: 'ORD-2025-450',
                mesa: 5,
              },
              producto: 'Pizza Pepperoni',
              cantidad: 1,
              estado: 'en_preparacion',
              tiempo_espera: '18 minutos',
              exceso_tiempo: '3 minutos',
              prioridad: 'alta',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getPrioritarios() {
    const data = await this.ordenDetalleService.getItemsPrioritarios();
    return {
      success: true,
      data,
    };
  }

  @Get('estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Estadísticas de cocina',
    description:
      'Dashboard de métricas de cocina: items procesados por periodo, tiempos promedio de preparación por producto/categoría, eficiencia por área, distribución de estados, items cancelados, productos más vendidos, horas pico. Filtrable por rango de fechas. Usado para KPIs operativos, evaluación de desempeño de cocina, optimización de procesos, planificación de personal.',
  })
  @ApiQuery({
    name: 'fecha_desde',
    required: false,
    description: 'Fecha inicio del periodo (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'fecha_hasta',
    required: false,
    description: 'Fecha fin del periodo (YYYY-MM-DD)',
    example: '2025-10-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas calculadas exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          periodo: {
            desde: '2025-10-01',
            hasta: '2025-10-15',
          },
          resumen: {
            total_items_procesados: 4567,
            items_por_dia: 304.5,
            tiempo_promedio_preparacion: '12.5 minutos',
            items_cancelados: 45,
            tasa_cancelacion: 0.98,
          },
          por_estado: {
            servidos: 4200,
            en_proceso: 322,
            cancelados: 45,
          },
          por_area: {
            cocina: {
              items: 3200,
              tiempo_promedio: '14 min',
              eficiencia: 88.5,
            },
            barra: {
              items: 1367,
              tiempo_promedio: '8 min',
              eficiencia: 92.3,
            },
          },
          productos_top: [
            {
              producto: 'Hamburguesa Clásica',
              cantidad: 890,
              porcentaje: 19.5,
            },
            {
              producto: 'Tacos al Pastor',
              cantidad: 678,
              porcentaje: 14.8,
            },
          ],
          horas_pico: [
            { hora: '13:00-14:00', items: 450 },
            { hora: '20:00-21:00', items: 520 },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getEstadisticas(@Query() dto: EstadisticasCocinaDto) {
    const stats = await this.ordenDetalleService.getEstadisticasCocina(dto);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('reporte-tiempos')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Reporte de tiempos de preparación',
    description:
      'Análisis detallado de tiempos de preparación por producto. Calcula tiempo promedio, mínimo, máximo, desviación estándar. Identifica productos lentos vs rápidos. Compara tiempos reales vs estimados. Detecta cuellos de botella. Agrupa por categoría y área. Incluye tendencias temporales. Usado para optimización de menú, ajuste de tiempos estimados, capacitación de personal, mejora de eficiencia operativa.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte generado exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          productos: [
            {
              producto: 'Hamburguesa Clásica',
              categoria: 'Comida',
              items_analizados: 890,
              tiempos: {
                promedio: '12 min',
                minimo: '8 min',
                maximo: '25 min',
                desviacion_estandar: '3.2 min',
              },
              tiempo_estimado: '10 min',
              diferencia: '+2 min',
              porcentaje_retraso: 20.0,
              clasificacion: 'lento',
              recomendacion:
                'Considerar optimizar proceso o ajustar tiempo estimado',
            },
            {
              producto: 'Ensalada César',
              categoria: 'Ensaladas',
              items_analizados: 345,
              tiempos: {
                promedio: '5 min',
                minimo: '3 min',
                maximo: '8 min',
                desviacion_estandar: '1.1 min',
              },
              tiempo_estimado: '6 min',
              diferencia: '-1 min',
              porcentaje_adelanto: -16.7,
              clasificacion: 'rapido',
            },
          ],
          resumen: {
            productos_analizados: 45,
            productos_lentos: 12,
            productos_rapidos: 28,
            productos_normales: 5,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getReporteTiempos() {
    const reporte = await this.ordenDetalleService.getReporteTiempos();
    return {
      success: true,
      data: reporte,
    };
  }

  @Get('categoria/:categoriaId')
  @Roles('Administrador', 'Gerente', 'Cocinero')
  @ApiOperation({
    summary: 'Items pendientes por categoría',
    description:
      'Lista items pendientes de preparación filtrados por categoría de producto. Útil para estaciones especializadas (parrilla, ensaladas, postres, bebidas). Ordenados por tiempo de espera. Incluye órdenes completas y detalles. Usado en KDS de estaciones específicas para enfocar trabajo por especialidad.',
  })
  @ApiParam({
    name: 'categoriaId',
    description: 'ID de la categoría de productos',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Items de la categoría obtenidos exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          categoria: {
            id: 5,
            nombre: 'Bebidas',
          },
          items_pendientes: 23,
          items: [
            {
              id_item: 1240,
              orden: {
                id: 457,
                numero: 'ORD-2025-457',
                mesa: 8,
              },
              producto: 'Margarita',
              cantidad: 2,
              estado: 'pendiente',
              notas: 'Con sal en el borde',
              tiempo_espera: '3 minutos',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Categoría con ID 999 no encontrada'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  async findByCategoria(
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
  ) {
    const items = await this.ordenDetalleService.findByCategoria(categoriaId);
    return {
      success: true,
      data: items,
    };
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero', 'Cocinero')
  @ApiOperation({
    summary: 'Obtener detalle de un item',
    description:
      'Retorna información completa de un item específico: producto, orden asociada, mesa, precio, cantidad, estado actual, notas especiales, modificadores, timestamps de cambios de estado, usuario que lo registró. Usado para consultas individuales y auditoría de items.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del item de orden',
    example: 1234,
  })
  @ApiResponse({
    status: 200,
    description: 'Item encontrado',
    schema: {
      example: {
        success: true,
        data: {
          id_item: 1234,
          orden: {
            id: 456,
            numero: 'ORD-2025-456',
            mesa: 12,
            mesero: 'Juan Pérez',
          },
          producto: {
            id: 12,
            nombre: 'Hamburguesa Clásica',
            sku: 'FOOD-001',
            categoria: 'Comida',
          },
          cantidad: 2,
          precio_unitario: 120.0,
          subtotal: 240.0,
          estado: 'en_preparacion',
          notas: 'Sin cebolla, término 3/4',
          modificadores: ['Extra queso', 'Sin tomate'],
          timestamps: {
            creado: '2025-10-15T20:00:00.000Z',
            iniciado_preparacion: '2025-10-15T20:02:00.000Z',
            tiempo_transcurrido: '8 minutos',
          },
          registrado_por: 'Juan Pérez',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
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
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.ordenDetalleService.findOne(id);
    return {
      success: true,
      data: item,
    };
  }

  @Patch('batch-estado')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({
    summary: 'Actualizar estado de múltiples items',
    description:
      'Actualiza estado de varios items simultáneamente. Operación en lote para eficiencia. Útil cuando múltiples items de misma orden/estación cambian al mismo tiempo (ej: todos los items de mesa 5 listos). Valida cada item individualmente. Si alguno falla, toda operación se revierte (transaccional). Registra usuario que realizó cambio masivo. Estados válidos: pendiente, en_preparacion, listo, servido. Usado para optimizar workflow en cocina cuando se finalizan múltiples platillos juntos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Items actualizados exitosamente',
    schema: {
      example: {
        success: true,
        message: '5 items actualizados exitosamente',
        data: {
          items_actualizados: 5,
          estado_nuevo: 'listo',
          items: [
            {
              id_item: 1234,
              producto: 'Hamburguesa Clásica',
              estado_anterior: 'en_preparacion',
              estado_nuevo: 'listo',
            },
            {
              id_item: 1235,
              producto: 'Papas Fritas',
              estado_anterior: 'en_preparacion',
              estado_nuevo: 'listo',
            },
          ],
          actualizado_por: {
            id: 8,
            nombre: 'Roberto Chef',
          },
          fecha_actualizacion: '2025-10-15T20:15:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error en validación de items',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'No se puede cambiar item 1237: ya está servido',
          'No se puede cambiar item 1238: pertenece a orden cancelada',
        ],
        data: {
          items_validos: [1234, 1235, 1236],
          items_invalidos: [1237, 1238],
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Uno o más items no encontrados',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Items no encontrados: [9998, 9999]'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  async batchUpdateEstado(@Body() dto: BatchUpdateEstadoDto, @Request() req) {
    const result = await this.ordenDetalleService.batchUpdateEstado(
      dto,
      req.user.userId,
    );
    return {
      success: true,
      ...result,
    };
  }
}
