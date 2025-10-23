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
} from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { RecepcionarCompraDto } from './dto/recepcionar-compra.dto';
import { CancelCompraDto } from './dto/cancel-compra.dto';
import { FilterCompraDto } from './dto/filter-compra.dto';
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
import { AprobarCompraDto } from './dto/aprobar-compra.dto';
import { CambiarEstadoCompraDto } from './dto/cambiar-estado-compra.dto';
import { ComparadorProveedoresService } from './comparador-proveedores.service';
import { AlertasReordenService } from './alertas-reorden.service';
import { SugerenciasCompraService } from './sugerencias-compra.service';

@ApiTags('Compras')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('compras')
export class ComprasController {
  constructor(
    private readonly comprasService: ComprasService,
    private readonly comparadorService: ComparadorProveedoresService,
    private readonly alertasService: AlertasReordenService,
    private readonly sugerenciasService: SugerenciasCompraService,
  ) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Crear una nueva orden de compra',
    description:
      'Crea orden de compra con detalle de productos a solicitar al proveedor. Incluye: productos con cantidades y precios unitarios, datos del proveedor (debe estar activo), condiciones de pago, fecha de entrega esperada, observaciones. Genera folio único automáticamente. Estado inicial: "Pendiente". Calcula total automáticamente. Valida disponibilidad de proveedor y productos. Registra usuario que solicita. Usado para gestión de reabastecimiento de inventario y control de compras.',
  })
  @ApiResponse({
    status: 201,
    description: 'Compra creada exitosamente con su detalle',
    schema: {
      example: {
        success: true,
        message: 'Orden de compra creada exitosamente',
        data: {
          id_compra: 123,
          folio_compra: 'COMP-2025-123',
          proveedor: {
            id: 15,
            nombre: 'Bebidas del Norte',
            rfc: 'DBN850615XYZ',
          },
          estado: 'Pendiente',
          fecha_solicitud: '2025-10-15T20:00:00.000Z',
          fecha_entrega_esperada: '2025-10-18T08:00:00.000Z',
          subtotal: 5200.0,
          iva: 832.0,
          total: 6032.0,
          usuario_solicita: 'Juan Pérez',
          detalle: [
            {
              producto: 'Cerveza Corona 355ml',
              cantidad: 100,
              precio_unitario: 18.5,
              subtotal: 1850.0,
            },
            {
              producto: 'Refresco Coca-Cola 600ml',
              cantidad: 150,
              precio_unitario: 12.0,
              subtotal: 1800.0,
            },
          ],
          items_count: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o proveedor inactivo',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['El proveedor está inactivo y no puede recibir órdenes'],
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
      'Permiso denegado - Solo Administrador y Gerente pueden crear compras',
  })
  @ApiResponse({
    status: 404,
    description: 'Proveedor o usuario no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Proveedor con ID 99 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  create(@Body() createCompraDto: CreateCompraDto) {
    return this.comprasService.create(createCompraDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener todas las compras con filtros opcionales',
    description:
      'Lista órdenes de compra con múltiples filtros: por proveedor, usuario solicitante, estado (pendiente/autorizada/recibida/cancelada), rango de fechas, folio específico. Incluye resumen de totales y estado de recepción. Soporta paginación y ordenamiento. Usado para seguimiento de compras, control de recepción y reportes de compras.',
  })
  @ApiQuery({
    name: 'id_proveedor',
    required: false,
    description: 'Filtrar por proveedor específico',
    example: 15,
  })
  @ApiQuery({
    name: 'id_usuario_solicita',
    required: false,
    description: 'Filtrar por usuario que solicitó la compra',
    example: 5,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['pendiente', 'autorizada', 'recibida', 'cancelada'],
    description:
      'Filtrar por estado: pendiente (creada, sin autorizar), autorizada (aprobada, pendiente recepción), recibida (mercancía recibida), cancelada',
    example: 'pendiente',
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
    name: 'folio_compra',
    required: false,
    description: 'Buscar por folio específico',
    example: 'COMP-2025-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de compras obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_compra: 123,
            folio: 'COMP-2025-123',
            proveedor: 'Bebidas del Norte',
            estado: 'Pendiente',
            fecha_solicitud: '2025-10-15',
            fecha_entrega_esperada: '2025-10-18',
            total: 6032.0,
            items_count: 2,
            usuario_solicita: 'Juan Pérez',
          },
          {
            id_compra: 120,
            folio: 'COMP-2025-120',
            proveedor: 'Carnes Premium',
            estado: 'Recibida',
            fecha_solicitud: '2025-10-10',
            fecha_recepcion: '2025-10-12',
            total: 8500.0,
            items_count: 5,
            usuario_solicita: 'María González',
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterCompraDto) {
    return this.comprasService.findAll(filters);
  }

  @Get('estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener estadísticas de compras',
    description:
      'Métricas agregadas de compras: total de órdenes por estado, monto total comprado, promedio por compra, tendencias mensuales, top proveedores. Opcional: filtrar por proveedor específico para ver su desempeño. Incluye comparativas con períodos anteriores. Usado para dashboards gerenciales y análisis de compras.',
  })
  @ApiQuery({
    name: 'id_proveedor',
    required: false,
    description: 'Filtrar estadísticas por proveedor específico',
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de compras calculadas',
    schema: {
      example: {
        success: true,
        data: {
          resumen_general: {
            total_compras: 156,
            monto_total: 450000.0,
            promedio_compra: 2884.62,
          },
          por_estado: {
            pendientes: { cantidad: 12, monto: 35000.0 },
            autorizadas: { cantidad: 8, monto: 28000.0 },
            recibidas: { cantidad: 130, monto: 375000.0 },
            canceladas: { cantidad: 6, monto: 12000.0 },
          },
          tendencia_mensual: [
            { mes: 'Octubre 2025', compras: 25, monto: 72000.0 },
            { mes: 'Septiembre 2025', compras: 30, monto: 85000.0 },
          ],
          top_proveedores: [
            {
              proveedor: 'Bebidas del Norte',
              compras: 45,
              monto: 125000.0,
              porcentaje: 27.8,
            },
            {
              proveedor: 'Carnes Premium',
              compras: 38,
              monto: 110000.0,
              porcentaje: 24.4,
            },
          ],
          productos_mas_comprados: [
            {
              producto: 'Cerveza Corona 355ml',
              cantidad: 5000,
              monto: 92500.0,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getEstadisticas(@Query('id_proveedor', ParseIntPipe) idProveedor?: number) {
    return this.comprasService.getEstadisticas(idProveedor);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener una compra por ID con su detalle completo',
    description:
      'Retorna información completa de una orden de compra: datos del proveedor, estado, fechas, totales, detalle de productos (cantidades, precios, subtotales), usuario solicitante, autorizaciones, fecha de recepción si aplica, observaciones. Usado para consulta detallada, seguimiento y auditoría de compras.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de compra',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Compra encontrada con detalle completo',
    schema: {
      example: {
        success: true,
        data: {
          id_compra: 123,
          folio_compra: 'COMP-2025-123',
          proveedor: {
            id: 15,
            nombre_comercial: 'Bebidas del Norte',
            razon_social: 'Distribuidora de Bebidas del Norte S.A. de C.V.',
            rfc: 'DBN850615XYZ',
            telefono: '442-123-4567',
          },
          estado: 'Autorizada',
          fecha_solicitud: '2025-10-15T20:00:00.000Z',
          fecha_entrega_esperada: '2025-10-18T08:00:00.000Z',
          fecha_autorizacion: '2025-10-15T21:00:00.000Z',
          usuario_solicita: {
            id: 5,
            nombre: 'Juan Pérez',
            rol: 'Gerente',
          },
          usuario_autoriza: {
            id: 2,
            nombre: 'Carlos Méndez',
            rol: 'Administrador',
          },
          detalle: [
            {
              id_detalle: 456,
              producto: {
                id: 12,
                nombre: 'Cerveza Corona 355ml',
                sku: 'BEB-001',
              },
              cantidad_solicitada: 100,
              precio_unitario: 18.5,
              subtotal: 1850.0,
            },
            {
              id_detalle: 457,
              producto: {
                id: 18,
                nombre: 'Refresco Coca-Cola 600ml',
                sku: 'BEB-015',
              },
              cantidad_solicitada: 150,
              precio_unitario: 12.0,
              subtotal: 1800.0,
            },
          ],
          subtotal: 5200.0,
          iva: 832.0,
          total: 6032.0,
          condiciones_pago: 'Crédito 30 días',
          observaciones: 'Entrega en almacén principal',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Compra no encontrada',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Orden de compra con ID 999 no encontrada'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Actualizar una compra pendiente',
    description:
      'Modifica orden de compra en estado "Pendiente": cambiar productos, cantidades, precios, proveedor, fechas, observaciones. Recalcula totales automáticamente. Solo permite edición antes de autorización. Compras autorizadas o recibidas no son editables. Registra modificación con usuario y fecha. Usado para correcciones antes de enviar orden al proveedor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de compra',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Compra actualizada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Orden de compra actualizada exitosamente',
        data: {
          id_compra: 123,
          folio: 'COMP-2025-123',
          cambios: {
            total_anterior: 6032.0,
            total_nuevo: 6850.0,
            items_modificados: 1,
          },
          fecha_modificacion: '2025-10-15T20:30:00.000Z',
          modificado_por: 'Juan Pérez',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden editar compras pendientes',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'No se puede editar: la compra ya está en estado "Autorizada"',
        ],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden actualizar',
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompraDto: UpdateCompraDto,
  ) {
    return this.comprasService.update(id, updateCompraDto);
  }

  @Patch(':id/autorizar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Autorizar una compra pendiente',
    description:
      'Cambia estado de "Pendiente" a "Autorizada" aprobando la orden. Requiere usuario autorizador con permisos. Registra fecha/hora de autorización. Orden autorizada no puede editarse, solo recibirse o cancelarse. Genera notificación al proveedor si está configurado. Usado para control de aprobaciones antes de enviar orden al proveedor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de compra',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Compra autorizada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Orden de compra autorizada exitosamente',
        data: {
          id_compra: 123,
          folio: 'COMP-2025-123',
          estado_anterior: 'Pendiente',
          estado_nuevo: 'Autorizada',
          total: 6032.0,
          proveedor: 'Bebidas del Norte',
          autorizada_por: 'Carlos Méndez',
          fecha_autorizacion: '2025-10-15T21:00:00.000Z',
          fecha_entrega_esperada: '2025-10-18T08:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden autorizar compras pendientes',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['La compra ya está autorizada'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden autorizar',
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  autorizar(
    @Param('id', ParseIntPipe) id: number,
    @Body('id_usuario_autoriza', ParseIntPipe) idUsuarioAutoriza: number,
  ) {
    return this.comprasService.autorizar(id, idUsuarioAutoriza);
  }

  @Patch(':id/recepcionar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary:
      'Recepcionar mercancía (marcar como recibida y actualizar cantidades)',
    description:
      'Registra recepción física de mercancía cambiando estado a "Recibida". Permite ajustar cantidades recibidas vs solicitadas (recepción parcial o completa). Genera movimientos de entrada a inventario automáticamente con lotes y fechas de caducidad. Registra usuario receptor y fecha/hora. Valida cantidades recibidas. Si hay diferencias, requiere observaciones. Actualiza stock de productos. Usado al recibir mercancía del proveedor.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de compra',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Compra recepcionada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Mercancía recepcionada exitosamente',
        data: {
          id_compra: 123,
          folio: 'COMP-2025-123',
          estado: 'Recibida',
          fecha_recepcion: '2025-10-18T10:30:00.000Z',
          recepcionado_por: 'Juan Pérez',
          resumen_recepcion: {
            items_totales: 2,
            items_completos: 1,
            items_parciales: 1,
            diferencias: true,
          },
          detalle_recepcion: [
            {
              producto: 'Cerveza Corona 355ml',
              cantidad_solicitada: 100,
              cantidad_recibida: 100,
              status: 'Completo',
              lote: 'LOTE-2025-001',
              fecha_caducidad: '2026-10-15',
            },
            {
              producto: 'Refresco Coca-Cola 600ml',
              cantidad_solicitada: 150,
              cantidad_recibida: 145,
              status: 'Parcial',
              diferencia: -5,
              observacion: 'Producto dañado en 5 unidades',
              lote: 'LOTE-2025-002',
            },
          ],
          inventario_actualizado: true,
          movimientos_generados: 2,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'La compra ya fue recibida o está cancelada',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['La compra ya fue recepcionada anteriormente'],
        data: {
          fecha_recepcion: '2025-10-17T14:00:00.000Z',
          recepcionado_por: 'María González',
        },
        timestamp: '2025-10-18T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden recepcionar',
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  recepcionar(
    @Param('id', ParseIntPipe) id: number,
    @Body() recepcionarCompraDto: RecepcionarCompraDto,
  ) {
    return this.comprasService.recepcionar(id, recepcionarCompraDto);
  }

  @Patch(':id/cancelar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Cancelar una compra',
    description:
      'Cancela orden de compra cambiando estado a "Cancelada". Requiere motivo obligatorio para auditoría. Solo permite cancelar compras en estados "Pendiente" o "Autorizada" (no recibidas). No elimina registro, solo marca como cancelada para trazabilidad. Notifica a proveedor si está configurado. Usado cuando se cancela pedido con proveedor, hay cambio de planes o errores en orden.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de compra',
    example: 123,
  })
  @ApiResponse({
    status: 200,
    description: 'Compra cancelada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Orden de compra cancelada exitosamente',
        data: {
          id_compra: 123,
          folio: 'COMP-2025-123',
          estado_anterior: 'Autorizada',
          estado_nuevo: 'Cancelada',
          proveedor: 'Bebidas del Norte',
          total: 6032.0,
          motivo_cancelacion: 'Cambio en necesidades de inventario',
          cancelada_por: 'Gerente',
          fecha_cancelacion: '2025-10-16T15:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'La compra ya está cancelada o recibida',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['No se puede cancelar: la mercancía ya fue recibida'],
        timestamp: '2025-10-18T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden cancelar',
  })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelCompraDto: CancelCompraDto,
  ) {
    return this.comprasService.cancel(id, cancelCompraDto);
  }
  @Patch(':id/cambiar-estado')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Cambiar estado de una compra',
    description:
      'Permite cambiar el estado de una compra validando transiciones permitidas',
  })
  @ApiParam({ name: 'id', description: 'ID de la compra' })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoCompraDto,
  ) {
    return this.comprasService.cambiarEstado(
      id,
      dto.accion,
      dto.id_usuario ?? 1, // ← CORRECCIÓN AQUÍ
      dto.observaciones,
    );
  }

  @Get(':id/historial-estados')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener historial de cambios de estado' })
  getHistorialEstados(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.getHistorialEstados(id);
  }

  @Post(':id/solicitar-aprobacion')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Solicitar aprobaciones multinivel' })
  solicitarAprobacion(
    @Param('id', ParseIntPipe) id: number,
    @Body('niveles') niveles: number[],
  ) {
    return this.comprasService.solicitarAprobacion(id, niveles);
  }

  @Patch(':id/procesar-aprobacion')
  @Roles('Administrador', 'Gerente', 'Director')
  @ApiOperation({ summary: 'Aprobar o rechazar una compra' })
  procesarAprobacion(@Body() dto: AprobarCompraDto) {
    return this.comprasService.procesarAprobacion(dto);
  }
  @Get('comparar-proveedores/producto/:idProducto')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Comparar proveedores para un producto específico',
    description: 'Muestra precios actuales, histórico y recomendación',
  })
  compararProveedores(@Param('idProducto', ParseIntPipe) idProducto: number) {
    return this.comparadorService.compararProveedoresPorProducto(idProducto);
  }

  @Post('comparar-proveedores/multiples')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Comparar proveedores para múltiples productos' })
  compararMultiples(@Body('productos') productos: number[]) {
    return this.comparadorService.compararVariosProductos(productos);
  }
  @Get('alertas/productos-reorden')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener productos que requieren reorden' })
  getProductosReorden() {
    return this.alertasService.getProductosRequierenReorden();
  }

  @Post('alertas/verificar-manual')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Ejecutar verificación de stock manualmente' })
  ejecutarVerificacionManual() {
    return this.alertasService.ejecutarVerificacionManual();
  }
  @Get('sugerencias/consumo-historico/:idProducto')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Analizar consumo histórico de un producto' })
  analizarConsumo(@Param('idProducto', ParseIntPipe) idProducto: number) {
    return this.sugerenciasService.analizarConsumoHistorico(idProducto);
  }

  @Get('sugerencias/predecir-demanda/:idProducto')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Predecir demanda futura de un producto' })
  predecirDemanda(@Param('idProducto', ParseIntPipe) idProducto: number) {
    return this.sugerenciasService.predecirDemanda(idProducto);
  }

  @Get('sugerencias/cantidad-optima/:idProducto')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Calcular cantidad económica de pedido (EOQ)' })
  optimizarCantidad(@Param('idProducto', ParseIntPipe) idProducto: number) {
    return this.sugerenciasService.optimizarCantidadPedido(idProducto);
  }

  @Get('sugerencias/orden-automatica')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Generar orden de compra sugerida automáticamente',
  })
  generarOrdenSugerida() {
    return this.sugerenciasService.generarOrdenSugerida();
  }
}
