import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { HistorialPreciosService } from './historial-precios.service';
import { CreateHistorialPrecioDto } from './dto/create-historial-precio.dto';
import { FilterHistorialPrecioDto } from './dto/filter-historial-precio.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Historial de Precios')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('historial-precios')
export class HistorialPreciosController {
  constructor(
    private readonly historialPreciosService: HistorialPreciosService,
  ) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un cambio de precio de producto',
    description:
      'Registra manualmente cambio de precio en el historial. Incluye precio anterior, precio nuevo, motivo del cambio, usuario responsable, fecha efectiva. Generalmente el sistema registra automáticamente al actualizar precios de productos, este endpoint es para registros manuales, correcciones o auditoría retroactiva. Mantiene trazabilidad completa de evolución de precios. Útil para análisis de márgenes, estrategias de pricing, auditorías, justificación de cambios. CRÍTICO para análisis de rentabilidad y compliance.',
  })
  @ApiResponse({
    status: 201,
    description: 'Cambio de precio registrado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Cambio de precio registrado exitosamente',
        data: {
          id_historial: 456,
          producto: {
            id: 12,
            nombre: 'Cerveza Corona 355ml',
            sku: 'BEB-001',
          },
          precio_anterior: 18.0,
          precio_nuevo: 20.0,
          diferencia: 2.0,
          porcentaje_cambio: 11.11,
          tipo_cambio: 'aumento',
          motivo: 'Ajuste por inflación y aumento de proveedor',
          usuario_modifica: {
            id: 5,
            nombre: 'Juan Pérez',
            rol: 'Gerente',
          },
          fecha_cambio: '2025-10-15T20:00:00.000Z',
          fecha_efectiva: '2025-10-16T00:00:00.000Z',
          afecta_menu: true,
          notificaciones_enviadas: ['equipo_ventas', 'punto_venta'],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'El precio nuevo debe ser diferente al precio anterior',
          'El precio no puede ser negativo o cero',
        ],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden registrar cambios de precio',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto o usuario no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Producto con ID 999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  create(@Body() createHistorialPrecioDto: CreateHistorialPrecioDto) {
    return this.historialPreciosService.create(createHistorialPrecioDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener todos los cambios de precio con filtros y paginación',
    description:
      'Lista histórico completo de cambios de precios del sistema con filtros: por producto específico, usuario que realizó cambios, rango de fechas. Incluye precios anteriores/nuevos, porcentajes de cambio, motivos. Soporta paginación y ordenamiento. Usado para análisis de estrategias de pricing, auditorías, reportes gerenciales, estudios de elasticidad precio-demanda, justificación de aumentos.',
  })
  @ApiQuery({
    name: 'id_producto',
    required: false,
    description: 'Filtrar cambios de un producto específico',
    type: Number,
    example: 12,
  })
  @ApiQuery({
    name: 'id_usuario_modifica',
    required: false,
    description: 'Filtrar por usuario que realizó el cambio',
    type: Number,
    example: 5,
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
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (inicia en 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Resultados por página (default: 50, max: 200)',
    type: Number,
    example: 50,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo por el que ordenar',
    enum: ['fecha_cambio', 'producto', 'precio_nuevo', 'porcentaje_cambio'],
    example: 'fecha_cambio',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Orden ascendente o descendente',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cambios de precio obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_historial: 456,
            producto: 'Cerveza Corona 355ml',
            sku: 'BEB-001',
            precio_anterior: 18.0,
            precio_nuevo: 20.0,
            cambio: '+$2.00 (+11.11%)',
            motivo: 'Ajuste por inflación',
            usuario: 'Juan Pérez',
            fecha: '2025-10-15T20:00:00.000Z',
          },
          {
            id_historial: 455,
            producto: 'Hamburguesa Clásica',
            sku: 'FOOD-001',
            precio_anterior: 120.0,
            precio_nuevo: 115.0,
            cambio: '-$5.00 (-4.17%)',
            motivo: 'Promoción temporal',
            usuario: 'María González',
            fecha: '2025-10-14T18:00:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        limit: 50,
        total_pages: 1,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterHistorialPrecioDto) {
    return this.historialPreciosService.findAll(filters);
  }

  @Get('producto/:id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener todo el historial de precios de un producto',
    description:
      'Lista línea de tiempo completa de cambios de precio de un producto específico. Ordenado cronológicamente. Incluye cada cambio: precio anterior/nuevo, porcentaje, motivo, usuario, fecha. Calcula tendencias: precio promedio, máximo/mínimo histórico, volatilidad, frecuencia de cambios. Muestra gráfica de evolución de precio. Usado para análisis de producto individual, justificar precio actual, estudiar comportamiento histórico, planear futuros ajustes.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    type: Number,
    example: 12,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de precios del producto obtenido exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          producto: {
            id: 12,
            nombre: 'Cerveza Corona 355ml',
            sku: 'BEB-001',
            precio_actual: 20.0,
          },
          historial: [
            {
              id_historial: 456,
              precio_anterior: 18.0,
              precio_nuevo: 20.0,
              diferencia: 2.0,
              porcentaje: 11.11,
              motivo: 'Ajuste por inflación',
              usuario: 'Juan Pérez',
              fecha: '2025-10-15T20:00:00.000Z',
            },
            {
              id_historial: 320,
              precio_anterior: 16.5,
              precio_nuevo: 18.0,
              diferencia: 1.5,
              porcentaje: 9.09,
              motivo: 'Aumento de proveedor',
              usuario: 'Carlos Méndez',
              fecha: '2025-08-01T10:00:00.000Z',
            },
            {
              id_historial: 180,
              precio_anterior: 15.0,
              precio_nuevo: 16.5,
              diferencia: 1.5,
              porcentaje: 10.0,
              motivo: 'Ajuste trimestral',
              usuario: 'Admin',
              fecha: '2025-05-01T09:00:00.000Z',
            },
          ],
          estadisticas: {
            total_cambios: 3,
            precio_minimo_historico: 15.0,
            precio_maximo_historico: 20.0,
            precio_promedio: 17.5,
            aumento_total_desde_inicio: 5.0,
            porcentaje_aumento_total: 33.33,
            ultimo_cambio: '15 días atrás',
            frecuencia_cambios: 'cada 2.5 meses',
            tendencia: 'alza',
            volatilidad: 'media',
          },
          periodo: {
            primer_precio: {
              valor: 15.0,
              fecha: '2025-01-15',
            },
            precio_actual: {
              valor: 20.0,
              fecha: '2025-10-15',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Producto con ID 999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findByProducto(@Param('id', ParseIntPipe) id: number) {
    return this.historialPreciosService.findByProducto(id);
  }

  @Get('producto/:id/precio-en-fecha')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener el precio vigente de un producto en una fecha específica',
    description:
      'Consulta histórica: retorna qué precio tenía un producto en una fecha pasada específica. Busca en historial el último precio vigente antes/en esa fecha. Útil para facturación retroactiva, auditorías, análisis históricos de ventas, recálculo de márgenes, resolver disputas sobre precios históricos. Si no hay cambios antes de la fecha, retorna precio inicial del producto.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a consultar',
    type: Number,
    example: 12,
  })
  @ApiQuery({
    name: 'fecha',
    description:
      'Fecha de consulta (YYYY-MM-DD) para ver precio vigente en ese momento',
    example: '2025-06-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Precio vigente obtenido exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          producto: {
            id: 12,
            nombre: 'Cerveza Corona 355ml',
            sku: 'BEB-001',
          },
          fecha_consulta: '2025-06-15',
          precio_vigente: 16.5,
          vigente_desde: '2025-05-01',
          vigente_hasta: '2025-07-31',
          cambio_mas_reciente: {
            id_historial: 180,
            fecha: '2025-05-01T09:00:00.000Z',
            precio_anterior: 15.0,
            precio_nuevo: 16.5,
            motivo: 'Ajuste trimestral',
          },
          precio_actual: 20.0,
          diferencia_vs_actual: -3.5,
          contexto: 'Este era el precio hace 4 meses',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró precio vigente en esa fecha',
    schema: {
      example: {
        success: false,
        code: 404,
        message: [
          'No se encontró precio vigente para el producto en la fecha 2025-06-15',
        ],
        data: {
          producto_id: 12,
          fecha_consulta: '2025-06-15',
          fecha_primer_precio: '2025-07-01',
          sugerencia:
            'La fecha consultada es anterior al registro del producto',
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  getPrecioEnFecha(
    @Param('id', ParseIntPipe) id: number,
    @Query('fecha') fecha: string,
  ) {
    return this.historialPreciosService.getPrecioEnFecha(id, fecha);
  }

  @Get('producto/:id/estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener estadísticas de cambios de precio de un producto',
    description:
      'Análisis estadístico completo del comportamiento de precio de un producto: total de cambios, frecuencia promedio, precio mín/máx/promedio, tendencia (alza/baja/estable), volatilidad, correlación con ventas si disponible, estacionalidad detectada, usuarios que más modifican. Incluye gráficos de evolución temporal. Predicción de próximo cambio basado en patrones. Usado para estrategia de pricing, análisis de competitividad, planificación financiera.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    type: Number,
    example: 12,
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          producto: {
            id: 12,
            nombre: 'Cerveza Corona 355ml',
            precio_actual: 20.0,
            categoria: 'Bebidas',
          },
          cambios_precio: {
            total_cambios: 8,
            aumentos: 7,
            disminuciones: 1,
            cambio_promedio: 1.83,
            cambio_promedio_porcentaje: 11.2,
          },
          precios: {
            minimo_historico: 15.0,
            maximo_historico: 20.0,
            promedio: 17.25,
            precio_actual: 20.0,
            precio_inicial: 15.0,
            aumento_total: 5.0,
            aumento_total_porcentaje: 33.33,
          },
          tendencias: {
            tendencia_general: 'alza',
            volatilidad: 'media',
            frecuencia_cambios: 'cada 1.5 meses',
            ultimo_cambio: '15 días atrás',
            proyeccion_proximo_cambio: '45 días',
          },
          periodo_analizado: {
            desde: '2025-01-15',
            hasta: '2025-10-15',
            dias_totales: 273,
          },
          usuarios_modificadores: [
            { usuario: 'Juan Pérez', cambios: 4 },
            { usuario: 'Carlos Méndez', cambios: 3 },
            { usuario: 'Admin', cambios: 1 },
          ],
          motivos_mas_frecuentes: [
            { motivo: 'Ajuste por inflación', veces: 3 },
            { motivo: 'Aumento de proveedor', veces: 2 },
            { motivo: 'Ajuste trimestral', veces: 2 },
          ],
          impacto_ventas: {
            elasticidad_estimada: -0.5,
            interpretacion: 'Producto relativamente inelástico',
            ventas_antes_ultimo_aumento: 450,
            ventas_despues_ultimo_aumento: 430,
            cambio_ventas_porcentaje: -4.44,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Producto con ID 999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  getEstadisticasProducto(@Param('id', ParseIntPipe) id: number) {
    return this.historialPreciosService.getEstadisticasProducto(id);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener un registro de historial por ID',
    description:
      'Retorna detalles completos de un cambio de precio específico: producto afectado, precio anterior/nuevo, diferencia absoluta y porcentual, motivo completo, usuario que realizó cambio, fecha/hora exacta, datos adicionales (autorización, notas). Usado para auditoría detallada de cambio específico o resolución de dudas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de historial',
    type: Number,
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Registro de historial encontrado',
    schema: {
      example: {
        success: true,
        data: {
          id_historial: 456,
          producto: {
            id: 12,
            nombre: 'Cerveza Corona 355ml',
            sku: 'BEB-001',
            categoria: 'Bebidas',
          },
          precio_anterior: 18.0,
          precio_nuevo: 20.0,
          diferencia_absoluta: 2.0,
          diferencia_porcentual: 11.11,
          tipo_cambio: 'aumento',
          motivo: 'Ajuste por inflación y aumento de proveedor del 8%',
          usuario_modifica: {
            id: 5,
            nombre: 'Juan Pérez',
            rol: 'Gerente',
            email: 'juan.perez@restaurant.com',
          },
          fecha_cambio: '2025-10-15T20:00:00.000Z',
          fecha_efectiva: '2025-10-16T00:00:00.000Z',
          autorizacion: {
            requirio_autorizacion: true,
            autorizado_por: 'Administrador',
            fecha_autorizacion: '2025-10-15T19:55:00.000Z',
          },
          contexto: {
            precio_competencia: 21.5,
            margen_anterior: 40.0,
            margen_nuevo: 44.4,
            costo_actual: 11.2,
          },
          notas_adicionales: 'Cambio aplicable a partir del lunes siguiente',
          metadata: {
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0...',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Registro de historial con ID 999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialPreciosService.findOne(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un registro de historial de precio',
    description:
      'Elimina registro específico del historial de precios. CUIDADO: operación delicada que afecta trazabilidad. Solo usar para corregir registros duplicados o erróneos ingresados por error. NO eliminar registros legítimos ya que rompe cadena de auditoría. Requiere rol de Administrador. Registra en log la eliminación. Alternativa recomendada: mantener registro con nota de corrección en lugar de eliminar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de historial a eliminar',
    type: Number,
    example: 456,
  })
  @ApiResponse({
    status: 204,
    description: 'Registro eliminado exitosamente (sin contenido en respuesta)',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador puede eliminar historial',
  })
  @ApiResponse({
    status: 404,
    description: 'Registro no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Registro de historial con ID 999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar por integridad referencial',
    schema: {
      example: {
        success: false,
        code: 409,
        message: [
          'No se puede eliminar: este registro está referenciado en análisis o reportes',
        ],
        suggestion: 'Considere marcar como corrección en lugar de eliminar',
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historialPreciosService.remove(id);
  }
}
