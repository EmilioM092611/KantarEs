import {
  Controller as Controller2,
  Get as Get2,
  Post as Post2,
  Body as Body2,
  Param as Param2,
  Query as Query2,
  ParseIntPipe as ParseIntPipe2,
  UseGuards as UseGuards2,
  HttpCode as HttpCode2,
  HttpStatus as HttpStatus2,
} from '@nestjs/common';
import { MovimientosInventarioService } from './movimientos-inventario.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { FilterMovimientoDto } from './dto/filter-movimiento.dto';
import {
  ApiTags as ApiTags2,
  ApiOperation as ApiOperation2,
  ApiResponse as ApiResponse2,
  ApiParam as ApiParam2,
  ApiQuery as ApiQuery2,
  ApiBearerAuth as ApiBearerAuth2,
} from '@nestjs/swagger';
import { JwtAuthGuard as JwtAuthGuard2 } from '../auth/guards/jwt-auth.guard';
import { RolesGuard as RolesGuard2 } from '../auth/guards/roles.guard';
import { Roles as Roles2 } from '../auth/decorators/roles.decorator';

@ApiTags2('Movimientos de Inventario')
@ApiBearerAuth2('JWT-auth')
@UseGuards2(JwtAuthGuard2, RolesGuard2)
@Controller2('movimientos-inventario')
export class MovimientosInventarioController {
  constructor(
    private readonly movimientosInventarioService: MovimientosInventarioService,
  ) {}

  @Post2()
  @Roles2('Administrador', 'Gerente')
  @HttpCode2(HttpStatus2.CREATED)
  @ApiOperation2({
    summary: 'Registrar un movimiento de inventario',
    description:
      'Registra una entrada, salida o ajuste de inventario y actualiza automáticamente el stock del producto. Tipos: Entrada por compra (suma), Salida por venta (resta), Ajuste por inventario físico (ajusta al valor exacto), Merma (resta), Devolución (suma/resta). Valida stock disponible antes de procesar salidas. Genera trazabilidad completa con usuario, fecha, lote, caducidad y observaciones. Integrado con compras y órdenes.',
  })
  @ApiResponse2({
    status: 201,
    description: 'Movimiento registrado y stock actualizado',
    schema: {
      example: {
        success: true,
        message: 'Movimiento registrado exitosamente',
        data: {
          id_movimiento: 789,
          tipo_movimiento: 'Entrada por compra',
          producto: 'Cerveza Corona',
          cantidad: 50,
          unidad_medida: 'Piezas',
          stock_anterior: 85,
          stock_nuevo: 135,
          lote: 'LOTE-2025-001',
          fecha_caducidad: '2026-10-15',
          costo_unitario: 18.5,
          usuario: 'Juan Pérez',
          fecha_movimiento: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse2({
    status: 400,
    description: 'Stock insuficiente para salida o producto no inventariable',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'Stock insuficiente: intentó restar 50 pero solo hay 30 disponibles',
        ],
        errors: {
          stock_actual: 30,
          cantidad_solicitada: 50,
          faltante: 20,
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse2({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse2({
    status: 403,
    description: 'Permiso denegado',
  })
  @ApiResponse2({
    status: 404,
    description: 'Tipo de movimiento, producto o usuario no encontrado',
  })
  create(@Body2() createMovimientoDto: CreateMovimientoDto) {
    return this.movimientosInventarioService.create(createMovimientoDto);
  }

  @Get2()
  @Roles2('Administrador', 'Gerente')
  @ApiOperation2({
    summary: 'Obtener todos los movimientos con filtros',
    description:
      'Lista movimientos de inventario con múltiples filtros: por producto, tipo de movimiento (entrada/salida/ajuste), usuario, compra, orden, lote, rango de fechas. Ordenados por fecha descendente. Usado para auditorías, reportes de trazabilidad y análisis de rotación de inventario.',
  })
  @ApiQuery2({
    name: 'id_producto',
    required: false,
    description: 'Filtrar por producto específico',
    example: 12,
  })
  @ApiQuery2({
    name: 'id_tipo_movimiento',
    required: false,
    description: 'Filtrar por tipo de movimiento',
    example: 1,
  })
  @ApiQuery2({
    name: 'id_usuario',
    required: false,
    description: 'Filtrar por usuario que registró',
    example: 5,
  })
  @ApiQuery2({
    name: 'id_compra',
    required: false,
    description: 'Filtrar por compra asociada',
    example: 23,
  })
  @ApiQuery2({
    name: 'id_orden',
    required: false,
    description: 'Filtrar por orden asociada',
    example: 456,
  })
  @ApiQuery2({
    name: 'afecta',
    required: false,
    enum: ['suma', 'resta', 'ajuste'],
    description: 'Filtrar por efecto en inventario',
  })
  @ApiQuery2({
    name: 'fecha_desde',
    required: false,
    description: 'Fecha inicio del rango (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @ApiQuery2({
    name: 'fecha_hasta',
    required: false,
    description: 'Fecha fin del rango (YYYY-MM-DD)',
    example: '2025-10-15',
  })
  @ApiQuery2({
    name: 'lote',
    required: false,
    description: 'Filtrar por lote específico',
    example: 'LOTE-2025-001',
  })
  @ApiResponse2({
    status: 200,
    description: 'Lista de movimientos filtrados',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_movimiento: 789,
            tipo: 'Entrada por compra',
            producto: 'Cerveza Corona',
            cantidad: 50,
            afecta: 'suma',
            usuario: 'Juan Pérez',
            fecha: '2025-10-15T20:00:00.000Z',
          },
        ],
        total: 1,
      },
    },
  })
  @ApiResponse2({ status: 401, description: 'No autorizado' })
  findAll(@Query2() filters: FilterMovimientoDto) {
    return this.movimientosInventarioService.findAll(filters);
  }

  @Get2('recientes')
  @Roles2('Administrador', 'Gerente', 'Cajero')
  @ApiOperation2({
    summary: 'Obtener los movimientos más recientes',
    description:
      'Retorna los N movimientos más recientes del sistema ordenados por fecha descendente. Vista rápida para monitoreo de actividad de inventario en tiempo real. Por defecto retorna últimos 20.',
  })
  @ApiQuery2({
    name: 'limite',
    required: false,
    description: 'Cantidad de movimientos a retornar (default: 20, max: 100)',
    example: 20,
  })
  @ApiResponse2({
    status: 200,
    description: 'Movimientos recientes',
  })
  @ApiResponse2({ status: 401, description: 'No autorizado' })
  getMovimientosRecientes(@Query2('limite', ParseIntPipe2) limite?: number) {
    return this.movimientosInventarioService.getMovimientosRecientes(
      limite || 20,
    );
  }

  @Get2('resumen-por-tipo')
  @Roles2('Administrador', 'Gerente')
  @ApiOperation2({
    summary: 'Obtener resumen agrupado por tipo de movimiento',
    description:
      'Estadísticas agregadas de movimientos por tipo (entradas, salidas, ajustes, mermas) con totales de cantidad y valor. Opcional filtrar por rango de fechas. Usado para dashboards gerenciales y análisis de flujo de inventario.',
  })
  @ApiQuery2({
    name: 'fecha_inicio',
    required: false,
    description: 'Fecha inicio del período (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @ApiQuery2({
    name: 'fecha_fin',
    required: false,
    description: 'Fecha fin del período (YYYY-MM-DD)',
    example: '2025-10-15',
  })
  @ApiResponse2({
    status: 200,
    description: 'Resumen por tipo de movimiento',
    schema: {
      example: {
        success: true,
        data: {
          periodo: {
            inicio: '2025-10-01',
            fin: '2025-10-15',
          },
          por_tipo: [
            {
              tipo: 'Entrada por compra',
              total_movimientos: 15,
              cantidad_total: 750,
              valor_total: 13875.0,
            },
            {
              tipo: 'Salida por venta',
              total_movimientos: 450,
              cantidad_total: 1200,
              valor_total: 22200.0,
            },
          ],
        },
      },
    },
  })
  @ApiResponse2({ status: 401, description: 'No autorizado' })
  getResumenPorTipo(
    @Query2('fecha_inicio') fechaInicio?: string,
    @Query2('fecha_fin') fechaFin?: string,
  ) {
    const inicio = fechaInicio ? new Date(fechaInicio) : undefined;
    const fin = fechaFin ? new Date(fechaFin) : undefined;
    return this.movimientosInventarioService.getResumenPorTipo(inicio, fin);
  }

  @Get2('producto/:idProducto')
  @Roles2('Administrador', 'Gerente', 'Cajero')
  @ApiOperation2({
    summary: 'Obtener historial de movimientos de un producto',
    description:
      'Lista completa de movimientos (entradas, salidas, ajustes) de un producto específico ordenados cronológicamente. Muestra últimos 50 por defecto. Incluye detalles de lote, caducidad, usuario y referencia a compra/orden. Usado para trazabilidad y auditorías.',
  })
  @ApiParam2({
    name: 'idProducto',
    description: 'ID del producto',
    example: 12,
  })
  @ApiResponse2({
    status: 200,
    description: 'Historial del producto (últimos 50)',
    schema: {
      example: {
        success: true,
        data: {
          producto: {
            id: 12,
            nombre: 'Cerveza Corona',
            sku: 'BEB-001',
            stock_actual: 135,
          },
          movimientos: [
            {
              id_movimiento: 789,
              tipo: 'Entrada por compra',
              cantidad: 50,
              fecha: '2025-10-15T20:00:00.000Z',
              lote: 'LOTE-2025-001',
              usuario: 'Juan Pérez',
            },
          ],
          total_movimientos: 1,
        },
      },
    },
  })
  @ApiResponse2({ status: 401, description: 'No autorizado' })
  findByProducto(@Param2('idProducto', ParseIntPipe2) idProducto: number) {
    return this.movimientosInventarioService.findByProducto(idProducto);
  }

  @Get2(':id')
  @Roles2('Administrador', 'Gerente', 'Cajero')
  @ApiOperation2({
    summary: 'Obtener un movimiento por ID',
    description:
      'Retorna el detalle completo de un movimiento específico incluyendo producto, tipo, cantidad, usuario, lote, caducidad, costo y referencias a compra/orden si aplica. Usado para auditorías detalladas.',
  })
  @ApiParam2({
    name: 'id',
    description: 'ID del movimiento',
    example: 789,
  })
  @ApiResponse2({
    status: 200,
    description: 'Movimiento encontrado con detalles completos',
    schema: {
      example: {
        success: true,
        data: {
          id_movimiento: 789,
          tipo_movimiento: 'Entrada por compra',
          producto: {
            id: 12,
            nombre: 'Cerveza Corona',
            sku: 'BEB-001',
          },
          cantidad: 50,
          unidad_medida: 'Piezas',
          lote: 'LOTE-2025-001',
          fecha_caducidad: '2026-10-15',
          costo_unitario: 18.5,
          costo_total: 925.0,
          usuario: 'Juan Pérez',
          compra: { id: 23, folio: 'COMP-2025-023' },
          observaciones: 'Compra regular de proveedor XYZ',
          fecha_movimiento: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse2({ status: 401, description: 'No autorizado' })
  @ApiResponse2({
    status: 404,
    description: 'Movimiento no encontrado',
  })
  findOne(@Param2('id', ParseIntPipe2) id: number) {
    return this.movimientosInventarioService.findOne(id);
  }
}
