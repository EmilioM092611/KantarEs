import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { AdjustInventarioDto } from './dto/adjust-inventario.dto';
import { FilterInventarioDto } from './dto/filter-inventario.dto';
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

@ApiTags('Inventario')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear registro de inventario para un producto',
    description:
      'Crea el registro de control de inventario para un producto específico. Define stocks mínimo/máximo, punto de reorden, ubicación y configuraciones especiales como refrigeración. Solo aplica a productos inventariables.',
  })
  @ApiResponse({
    status: 201,
    description: 'Inventario creado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Inventario creado exitosamente',
        data: {
          id_inventario: 45,
          id_producto: 12,
          stock_actual: 100,
          stock_minimo: 20,
          stock_maximo: 200,
          punto_reorden: 30,
          ubicacion_almacen: 'A-12',
          requiere_refrigeracion: true,
          estado: 'normal',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Producto no inventariable o datos inválidos',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['El producto no es inventariable'],
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
    description: 'Permiso denegado - Rol insuficiente',
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe inventario para este producto',
    schema: {
      example: {
        success: false,
        code: 409,
        message: ['Ya existe un registro de inventario para este producto'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  create(@Body() createInventarioDto: CreateInventarioDto) {
    return this.inventarioService.create(createInventarioDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener todos los inventarios con filtros opcionales',
    description:
      'Lista todos los registros de inventario con múltiples opciones de filtrado: por producto, estado (crítico/bajo/normal/exceso), refrigeración, ubicación. Calcula automáticamente el estado según stocks mínimo/máximo. Útil para reportes y alertas de reabastecimiento.',
  })
  @ApiQuery({
    name: 'id_producto',
    required: false,
    description: 'Filtrar por ID de producto específico',
    example: 12,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['critico', 'bajo', 'normal', 'exceso'],
    description:
      'Filtrar por estado calculado del stock: crítico (< stock_minimo), bajo (< punto_reorden), normal, exceso (> stock_maximo)',
  })
  @ApiQuery({
    name: 'requiere_refrigeracion',
    required: false,
    description: 'Filtrar productos que requieren refrigeración',
    type: Boolean,
  })
  @ApiQuery({
    name: 'ubicacion_almacen',
    required: false,
    description: 'Filtrar por ubicación en almacén',
    example: 'A-12',
  })
  @ApiQuery({
    name: 'solo_bajo_stock',
    required: false,
    description: 'Mostrar solo productos con stock por debajo del mínimo',
    type: Boolean,
  })
  @ApiQuery({
    name: 'punto_reorden_alcanzado',
    required: false,
    description: 'Mostrar solo productos que alcanzaron el punto de reorden',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de inventarios con estado calculado',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_inventario: 45,
            id_producto: 12,
            producto: { nombre: 'Cerveza Corona', sku: 'BEB-001' },
            stock_actual: 15,
            stock_minimo: 20,
            stock_maximo: 200,
            punto_reorden: 30,
            estado: 'critico',
            ubicacion_almacen: 'A-12',
            requiere_refrigeracion: true,
          },
        ],
        count: 1,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterInventarioDto) {
    return this.inventarioService.findAll(filters);
  }

  @Get('alertas/bajo-stock')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener productos con stock bajo el mínimo',
    description:
      'Retorna todos los productos cuyo stock actual está por debajo del stock mínimo configurado. Usado para alertas críticas de reabastecimiento inmediato y prevención de quiebres de stock en operación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos críticos con detalle de faltante',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_inventario: 45,
            producto: 'Cerveza Corona',
            sku: 'BEB-001',
            stock_actual: 15,
            stock_minimo: 20,
            faltante: 5,
            alerta: 'critico',
          },
        ],
        total_criticos: 1,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProductosBajoStock() {
    return this.inventarioService.getProductosBajoStock();
  }

  @Get('alertas/reorden')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener productos que alcanzaron el punto de reorden',
    description:
      'Lista productos que llegaron o están por debajo del punto de reorden configurado. Incluye cantidad sugerida de compra basada en stock máximo. Usado para planificación de órdenes de compra y evitar agotamiento de inventario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos en punto de reorden con cantidad sugerida',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_inventario: 45,
            producto: 'Cerveza Corona',
            stock_actual: 25,
            punto_reorden: 30,
            stock_maximo: 200,
            cantidad_sugerida: 175,
            proveedor_preferido: 'Distribuidora XYZ',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProductosReorden() {
    return this.inventarioService.getProductosReorden();
  }

  @Get('estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener estadísticas generales del inventario',
    description:
      'Dashboard de métricas clave: total de productos inventariados, productos en estado crítico, productos en punto de reorden, distribución por estado y valor total del inventario. Usado para KPIs y toma de decisiones.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del inventario',
    schema: {
      example: {
        success: true,
        data: {
          total_productos: 150,
          productos_criticos: 8,
          productos_punto_reorden: 15,
          productos_normal: 120,
          productos_exceso: 7,
          valor_total_inventario: '1250000.00',
          ultima_actualizacion: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getEstadisticas() {
    return this.inventarioService.getEstadisticas();
  }

  @Get('producto/:idProducto')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Obtener inventario de un producto específico',
    description:
      'Obtiene el registro completo de inventario de un producto incluyendo movimientos recientes, estado actual, alertas y configuración de stocks. Usado para consulta rápida de disponibilidad.',
  })
  @ApiParam({
    name: 'idProducto',
    description: 'ID del producto',
    example: 12,
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario del producto con detalles',
    schema: {
      example: {
        success: true,
        data: {
          id_inventario: 45,
          producto: {
            id_producto: 12,
            nombre: 'Cerveza Corona',
            sku: 'BEB-001',
          },
          stock_actual: 85,
          stock_minimo: 20,
          stock_maximo: 200,
          estado: 'normal',
          movimientos_recientes: 5,
          ultima_compra: '2025-10-10',
          ultimo_inventario: '2025-10-01',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'No existe inventario para este producto',
  })
  findByProducto(@Param('idProducto', ParseIntPipe) idProducto: number) {
    return this.inventarioService.findByProducto(idProducto);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener un inventario por ID',
    description:
      'Obtiene un registro de inventario específico con toda su configuración y estado calculado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del inventario',
    example: 45,
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario encontrado con estado calculado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Inventario no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Actualizar configuración de inventario',
    description:
      'Modifica parámetros de control del inventario: stocks mínimo/máximo, punto de reorden, ubicación, configuración de refrigeración y días de caducidad. No modifica el stock actual (usar ajuste de stock para eso).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del inventario',
    example: 45,
  })
  @ApiResponse({
    status: 200,
    description: 'Inventario actualizado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Configuración de inventario actualizada',
        data: {
          id_inventario: 45,
          stock_minimo: 25,
          stock_maximo: 250,
          punto_reorden: 35,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Inventario no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventarioDto: UpdateInventarioDto,
  ) {
    return this.inventarioService.update(id, updateInventarioDto);
  }

  @Patch(':id/ajustar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Ajustar stock manualmente (para inventario físico)',
    description:
      'Ajusta el stock actual cuando hay diferencias entre sistema y conteo físico. Registra automáticamente el movimiento en historial con motivo. Usado para correcciones de inventario, mermas no registradas o diferencias encontradas en auditorías.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del inventario',
    example: 45,
  })
  @ApiResponse({
    status: 200,
    description: 'Stock ajustado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Stock ajustado correctamente',
        data: {
          id_inventario: 45,
          stock_anterior: 85,
          stock_nuevo: 82,
          diferencia: -3,
          motivo: 'Inventario físico - diferencia encontrada',
          ajustado_por: 'Juan Pérez',
          fecha_ajuste: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Inventario no encontrado' })
  adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() adjustInventarioDto: AdjustInventarioDto,
  ) {
    return this.inventarioService.adjustStock(id, adjustInventarioDto);
  }
}
