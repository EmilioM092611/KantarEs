/* eslint-disable @typescript-eslint/no-unused-vars */
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
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { CancelPagoDto } from './dto/cancel-pago.dto';
import { FilterPagoDto } from './dto/filter-pago.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Idempotent } from '../common/decorators/idempotent.decorator';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';

@ApiTags('Pagos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(IdempotencyInterceptor)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Idempotent()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Registrar un nuevo pago',
    description:
      'Registra un pago parcial o total de una orden. Valida que el monto no exceda el saldo pendiente. Soporta múltiples métodos de pago (Efectivo, Tarjeta, Transferencia, etc.). Si requiere referencia, debe incluir número de autorización/comprobante. Actualiza saldo de orden automáticamente. Implementa idempotencia mediante header "Idempotency-Key" para evitar pagos duplicados (recomendado en integraciones). Registra usuario que cobró y método de pago. Estado inicial: "Completado". Usado en punto de venta al cobrar cuenta.',
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description:
      'Clave única (UUID) para evitar pagos duplicados. Si envía la misma key en múltiples requests, solo se procesará una vez y las subsecuentes retornarán el mismo resultado. Altamente recomendado en integraciones de pago para evitar cobros duplicados en caso de timeouts o reintentos de red.',
    required: false,
    schema: {
      type: 'string',
      example: '550e8400-e29b-41d4-a716-446655440000',
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Pago registrado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Pago registrado exitosamente',
        data: {
          id_pago: 789,
          id_orden: 456,
          metodo_pago: 'Tarjeta Crédito',
          monto: 455.0,
          referencia: 'AUTH-12345678',
          estado: 'Completado',
          cobrado_por: 'Juan Pérez',
          fecha_pago: '2025-10-15T20:00:00.000Z',
          orden: {
            total: 455.0,
            pagado: 455.0,
            saldo_pendiente: 0,
            estado: 'Pagada',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o monto excede el saldo pendiente',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['El monto de $500 excede el saldo pendiente de $455'],
        errors: {
          total_orden: 455,
          ya_pagado: 0,
          saldo_pendiente: 455,
          monto_intentado: 500,
          excedente: 45,
        },
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
    description: 'Permiso denegado - Rol insuficiente para registrar pagos',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden o método de pago no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Orden con ID 456 no encontrada'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Request duplicado detectado por Idempotency-Key - Retorna el pago original',
    schema: {
      example: {
        success: true,
        message: 'Request duplicado - Retornando pago original',
        data: {
          id_pago: 789,
          procesado_originalmente: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  create(@Body() createPagoDto: CreatePagoDto, @Request() req) {
    return this.pagosService.create(createPagoDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener todos los pagos con filtros opcionales',
    description:
      'Lista pagos con múltiples filtros: por orden, método de pago, estado (Completado/Cancelado), rango de fechas. Incluye datos de orden asociada y usuario que cobró. Soporta paginación. Usado para reportes de caja, auditorías y cuadres diarios.',
  })
  @ApiQuery({
    name: 'id_orden',
    required: false,
    description: 'Filtrar pagos de una orden específica',
    example: 456,
  })
  @ApiQuery({
    name: 'id_metodo_pago',
    required: false,
    description: 'Filtrar por método de pago (1=Efectivo, 2=Tarjeta, etc.)',
    example: 1,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado del pago',
    enum: ['Completado', 'Cancelado'],
    example: 'Completado',
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
    description: 'Lista de pagos obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_pago: 789,
            orden: { numero: 'ORD-2025-456', mesa: 12 },
            metodo_pago: 'Efectivo',
            monto: 455.0,
            estado: 'Completado',
            cobrado_por: 'Juan Pérez',
            fecha: '2025-10-15T20:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterPagoDto) {
    return this.pagosService.findAll(filters);
  }

  @Get('orden/:idOrden')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Obtener todos los pagos de una orden específica',
    description:
      'Lista todos los pagos aplicados a una orden (parciales y totales). Incluye método usado, monto, referencias, estado y usuario que cobró. Muestra histórico completo incluyendo pagos cancelados. Útil para auditorías y resolver discrepancias. Usado para verificar cómo se pagó una orden.',
  })
  @ApiParam({
    name: 'idOrden',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Pagos de la orden obtenidos exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          orden: {
            id_orden: 456,
            numero: 'ORD-2025-456',
            total: 455.0,
          },
          pagos: [
            {
              id_pago: 789,
              metodo: 'Efectivo',
              monto: 300.0,
              estado: 'Completado',
              fecha: '2025-10-15T19:45:00.000Z',
            },
            {
              id_pago: 790,
              metodo: 'Tarjeta Débito',
              monto: 155.0,
              referencia: 'AUTH-98765',
              estado: 'Completado',
              fecha: '2025-10-15T19:46:00.000Z',
            },
          ],
          total_pagado: 455.0,
          saldo_pendiente: 0,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  findByOrden(@Param('idOrden', ParseIntPipe) idOrden: number) {
    return this.pagosService.findByOrden(idOrden);
  }

  @Get('orden/:idOrden/total')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Obtener el total pagado de una orden',
    description:
      'Calcula y retorna la suma de todos los pagos completados de una orden. Excluye pagos cancelados. Usado para validar saldo pendiente y verificar si orden está completamente pagada.',
  })
  @ApiParam({
    name: 'idOrden',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Total pagado de la orden',
    schema: {
      example: {
        success: true,
        data: {
          id_orden: 456,
          total_orden: 455.0,
          total_pagado: 455.0,
          saldo_pendiente: 0,
          cantidad_pagos: 2,
          esta_pagada: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async getTotalByOrden(@Param('idOrden', ParseIntPipe) idOrden: number) {
    const total = await this.pagosService.getTotalByOrden(idOrden);
    return { total_pagado: total };
  }

  @Get('reporte/diario')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener reporte de pagos del día',
    description:
      'Genera reporte de pagos de un día específico (hoy por defecto). Agrupa por método de pago con totales. Incluye cantidad de transacciones, montos y comisiones. Cuenta pagos completados vs cancelados. Usado para cierre de caja y cuadre diario. Crucial para reconciliación de efectivo y terminal bancaria.',
  })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description:
      'Fecha del reporte (YYYY-MM-DD). Si no se especifica, usa fecha actual.',
    example: '2025-10-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte diario generado exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          fecha: '2025-10-15',
          resumen: {
            total_ingresos: 12450.0,
            cantidad_pagos: 87,
            pagos_cancelados: 3,
            monto_cancelado: 340.0,
          },
          por_metodo: [
            {
              metodo: 'Efectivo',
              cantidad: 45,
              monto_total: 6780.0,
              comisiones: 0,
              porcentaje: 54.5,
            },
            {
              metodo: 'Tarjeta Crédito',
              cantidad: 30,
              monto_total: 4320.0,
              comisiones: 108.0,
              porcentaje: 34.7,
            },
            {
              metodo: 'Tarjeta Débito',
              cantidad: 12,
              monto_total: 1350.0,
              comisiones: 20.25,
              porcentaje: 10.8,
            },
          ],
          ordenes_pagadas: 82,
          ordenes_parcialmente_pagadas: 5,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getReporteDiario(@Query('fecha') fecha?: string) {
    const fechaReporte = fecha ? new Date(fecha) : new Date();
    return this.pagosService.getReporteDiario(fechaReporte);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener un pago por ID',
    description:
      'Retorna detalles completos de un pago específico: orden asociada, método usado, monto, referencias, estado, usuario que cobró, fecha/hora. Incluye información de corte de caja si aplica. Usado para auditorías y resolución de disputas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pago',
    example: 789,
  })
  @ApiResponse({
    status: 200,
    description: 'Pago encontrado con detalles completos',
    schema: {
      example: {
        success: true,
        data: {
          id_pago: 789,
          orden: {
            id: 456,
            numero: 'ORD-2025-456',
            mesa: 12,
            total: 455.0,
          },
          metodo_pago: {
            id: 1,
            nombre: 'Efectivo',
            comision_porcentaje: 0,
          },
          monto: 455.0,
          referencia: null,
          estado: 'Completado',
          usuario_cobra: {
            id: 5,
            nombre: 'Juan Pérez',
            rol: 'Cajero',
          },
          corte_caja: {
            id: 12,
            folio: 'CORTE-2025-12',
            estado: 'Abierto',
          },
          fecha_pago: '2025-10-15T20:00:00.000Z',
          notas: null,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Pago no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Pago con ID 999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Actualizar información de un pago pendiente',
    description:
      'Modifica datos de un pago en estado "Completado": agregar/editar referencia, notas, ajustar monto (requiere autorización especial). Solo permite edición si el pago está en corte de caja abierto. No permite cambiar método de pago ni orden asociada. Registra quien modificó y cuándo. Usado para correcciones administrativas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pago a actualizar',
    example: 789,
  })
  @ApiResponse({
    status: 200,
    description: 'Pago actualizado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Pago actualizado exitosamente',
        data: {
          id_pago: 789,
          monto_anterior: 455.0,
          monto_nuevo: 455.0,
          referencia: 'AUTH-12345678-CORREGIDO',
          notas: 'Referencia corregida',
          modificado_por: 'Gerente',
          fecha_modificacion: '2025-10-15T20:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'No se puede actualizar el pago (estado no válido o en corte cerrado)',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'No se puede modificar: el pago está en un corte de caja cerrado',
        ],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden actualizar pagos',
  })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagoDto: UpdatePagoDto,
  ) {
    return this.pagosService.update(id, updatePagoDto);
  }

  @Patch(':id/cancelar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Cancelar un pago',
    description:
      'Cancela un pago completado cambiando su estado a "Cancelado". Requiere motivo obligatorio para auditoría. Actualiza saldo pendiente de orden automáticamente. Solo permite cancelar si el pago está en corte de caja abierto. No elimina registro, solo cambia estado para trazabilidad. Usado para correcciones de cobros erróneos, devoluciones o ajustes administrativos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pago a cancelar',
    example: 789,
  })
  @ApiResponse({
    status: 200,
    description: 'Pago cancelado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Pago cancelado exitosamente',
        data: {
          id_pago: 789,
          estado_anterior: 'Completado',
          estado_nuevo: 'Cancelado',
          monto_devuelto: 455.0,
          motivo: 'Cobro duplicado por error de sistema',
          cancelado_por: 'Gerente',
          fecha_cancelacion: '2025-10-15T21:00:00.000Z',
          orden: {
            id: 456,
            saldo_pendiente_actualizado: 455.0,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'No se puede cancelar el pago (ya cancelado o en corte cerrado)',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['El pago ya está cancelado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden cancelar pagos',
  })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelPagoDto: CancelPagoDto,
  ) {
    return this.pagosService.cancel(id, cancelPagoDto);
  }
}
