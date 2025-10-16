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
import { CortesCajaService } from './cortes-caja.service';
import { CreateCorteCajaDto } from './dto/create-corte-caja.dto';
import { CloseCorteCajaDto } from './dto/close-corte-caja.dto';
import { CancelCorteCajaDto } from './dto/cancel-corte-caja.dto';
import { FilterCorteCajaDto } from './dto/filter-corte-caja.dto';
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

@ApiTags('Cortes de Caja')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cortes-caja')
export class CortesCajaController {
  constructor(private readonly cortesCajaService: CortesCajaService) {}

  @Post()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Abrir un nuevo corte de caja',
    description:
      'Inicia un nuevo corte de caja para comenzar operaciones. Registra monto inicial de efectivo en caja (fondo fijo). Valida que no exista otro corte abierto previamente. Tipos de corte: Diario (apertura/cierre diario), Parcial (cambio de turno), Extraordinario (auditoría). Genera folio único automático. Registra usuario responsable y fecha/hora de apertura. Solo puede haber un corte abierto a la vez. Usado al iniciar operaciones del día o turno.',
  })
  @ApiResponse({
    status: 201,
    description: 'Corte de caja abierto exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Corte de caja abierto exitosamente',
        data: {
          id_corte: 45,
          folio_corte: 'CORTE-2025-045',
          tipo_corte: 'Diario',
          monto_inicial: 500.0,
          estado: 'Abierto',
          usuario_realiza: 'Juan Pérez',
          fecha_apertura: '2025-10-15T08:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o monto inicial negativo',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['El monto inicial no puede ser negativo'],
        timestamp: '2025-10-15T08:00:00.000Z',
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
  @ApiResponse({
    status: 409,
    description: 'Ya existe un corte abierto',
    schema: {
      example: {
        success: false,
        code: 409,
        message: ['Ya existe un corte de caja abierto (Folio: CORTE-2025-044)'],
        data: {
          corte_abierto: {
            id: 44,
            folio: 'CORTE-2025-044',
            abierto_desde: '2025-10-14T08:00:00.000Z',
            usuario: 'María González',
          },
        },
        timestamp: '2025-10-15T08:00:00.000Z',
      },
    },
  })
  create(@Body() createCorteCajaDto: CreateCorteCajaDto) {
    return this.cortesCajaService.create(createCorteCajaDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener todos los cortes de caja con filtros',
    description:
      'Lista histórico de cortes de caja con múltiples filtros: por tipo de corte, usuario que realizó, estado (Abierto/Cerrado/Cancelado), rango de fechas, folio específico. Incluye resumen de montos y diferencias. Soporta paginación. Usado para auditorías, reportes gerenciales y análisis de operación de caja.',
  })
  @ApiQuery({
    name: 'id_tipo_corte',
    required: false,
    description:
      'Filtrar por tipo de corte (1=Diario, 2=Parcial, 3=Extraordinario)',
    example: 1,
  })
  @ApiQuery({
    name: 'id_usuario_realiza',
    required: false,
    description: 'Filtrar por usuario que realizó el corte',
    example: 5,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado del corte',
    enum: ['Abierto', 'Cerrado', 'Cancelado'],
    example: 'Cerrado',
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
    name: 'folio_corte',
    required: false,
    description: 'Buscar por folio específico',
    example: 'CORTE-2025-045',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cortes de caja obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_corte: 44,
            folio: 'CORTE-2025-044',
            tipo: 'Diario',
            monto_inicial: 500.0,
            monto_final: 12950.0,
            diferencia: 0,
            estado: 'Cerrado',
            usuario: 'María González',
            fecha_apertura: '2025-10-14T08:00:00.000Z',
            fecha_cierre: '2025-10-14T22:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterCorteCajaDto) {
    return this.cortesCajaService.findAll(filters);
  }

  @Get('abierto')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener el corte de caja actualmente abierto',
    description:
      'Retorna el corte de caja activo (estado "Abierto") si existe. Incluye resumen en tiempo real: pagos registrados, totales por método de pago, monto esperado vs efectivo en caja. Retorna null si no hay corte abierto. Usado para monitoreo de operaciones en curso y validar que exista corte abierto antes de registrar pagos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Corte abierto encontrado o null si no hay ninguno',
    schema: {
      example: {
        success: true,
        data: {
          id_corte: 45,
          folio: 'CORTE-2025-045',
          tipo: 'Diario',
          monto_inicial: 500.0,
          usuario: 'Juan Pérez',
          fecha_apertura: '2025-10-15T08:00:00.000Z',
          tiempo_abierto: '12 horas',
          resumen_actual: {
            total_pagos: 87,
            total_efectivo: 6780.0,
            total_tarjetas: 5670.0,
            monto_esperado_caja: 7280.0,
            ordenes_pendientes: 5,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findCorteAbierto() {
    return this.cortesCajaService.findCorteAbierto();
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener un corte de caja por ID',
    description:
      'Retorna detalles completos de un corte específico: montos inicial/final, totales por método de pago, cantidad de transacciones, diferencias (sobrantes/faltantes), usuarios involucrados, observaciones. Incluye detalle de pagos asociados si está cerrado. Usado para auditorías detalladas y resolución de diferencias.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del corte de caja',
    example: 45,
  })
  @ApiResponse({
    status: 200,
    description: 'Corte de caja encontrado con detalles completos',
    schema: {
      example: {
        success: true,
        data: {
          id_corte: 44,
          folio: 'CORTE-2025-044',
          tipo_corte: 'Diario',
          estado: 'Cerrado',
          monto_inicial: 500.0,
          monto_final: 12950.0,
          usuario_apertura: 'María González',
          usuario_cierre: 'Gerente',
          fecha_apertura: '2025-10-14T08:00:00.000Z',
          fecha_cierre: '2025-10-14T22:00:00.000Z',
          resumen: {
            total_pagos: 145,
            por_metodo: [
              {
                metodo: 'Efectivo',
                cantidad: 78,
                monto: 8950.0,
              },
              {
                metodo: 'Tarjeta',
                cantidad: 67,
                monto: 3500.0,
              },
            ],
            monto_esperado: 12950.0,
            monto_declarado: 12950.0,
            diferencia: 0,
            sobrante: 0,
            faltante: 0,
          },
          observaciones: 'Cuadre correcto sin diferencias',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Corte de caja no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Corte de caja con ID 999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cortesCajaService.findOne(id);
  }

  @Patch(':id/cerrar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Cerrar un corte de caja',
    description:
      'Cierra corte de caja activo registrando conteo físico final. Calcula automáticamente diferencias entre sistema y físico. Requiere desglose de efectivo (billetes/monedas) y totales por cada método de pago. Valida que corte esté en estado "Abierto". Registra usuario que cierra y fecha/hora. Genera reporte de cierre con todos los movimientos. Congela pagos del corte (no se pueden modificar después). Diferencias comunes: efectivo mal contado, pagos no registrados, propinas no declaradas. Usado al finalizar turno o día laboral.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del corte de caja a cerrar',
    example: 45,
  })
  @ApiResponse({
    status: 200,
    description: 'Corte de caja cerrado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Corte de caja cerrado exitosamente',
        data: {
          id_corte: 45,
          folio: 'CORTE-2025-045',
          estado: 'Cerrado',
          fecha_apertura: '2025-10-15T08:00:00.000Z',
          fecha_cierre: '2025-10-15T22:00:00.000Z',
          duracion: '14 horas',
          monto_inicial: 500.0,
          monto_esperado: 12950.0,
          monto_declarado: 12945.0,
          diferencia: -5.0,
          tipo_diferencia: 'Faltante',
          resumen_cierre: {
            total_operaciones: 145,
            efectivo: {
              esperado: 8950.0,
              declarado: 8945.0,
              diferencia: -5.0,
            },
            tarjetas: {
              esperado: 3500.0,
              declarado: 3500.0,
              diferencia: 0,
            },
            transferencias: {
              esperado: 500.0,
              declarado: 500.0,
              diferencia: 0,
            },
          },
          cerrado_por: 'Gerente',
          observaciones: 'Faltante de $5 identificado',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'El corte no está abierto o datos inválidos',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['El corte ya está cerrado'],
        timestamp: '2025-10-15T22:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden cerrar cortes',
  })
  @ApiResponse({ status: 404, description: 'Corte de caja no encontrado' })
  close(
    @Param('id', ParseIntPipe) id: number,
    @Body() closeCorteCajaDto: CloseCorteCajaDto,
  ) {
    return this.cortesCajaService.close(id, closeCorteCajaDto);
  }

  @Patch(':id/cancelar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Cancelar un corte de caja abierto',
    description:
      'Cancela un corte de caja que está en estado "Abierto". Requiere motivo obligatorio para auditoría. No elimina registros, solo marca como "Cancelado" para trazabilidad. Los pagos asociados se reasignan o quedan huérfanos según configuración. Solo se puede cancelar cortes abiertos, los cerrados no son modificables. Usado en casos excepcionales: error al abrir corte, necesidad de reiniciar operaciones, cambios de política. Requiere autorización gerencial.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del corte de caja a cancelar',
    example: 45,
  })
  @ApiResponse({
    status: 200,
    description: 'Corte de caja cancelado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Corte de caja cancelado exitosamente',
        data: {
          id_corte: 45,
          folio: 'CORTE-2025-045',
          estado_anterior: 'Abierto',
          estado_nuevo: 'Cancelado',
          motivo_cancelacion: 'Error en monto inicial - Se abrirá nuevo corte',
          fecha_apertura: '2025-10-15T08:00:00.000Z',
          fecha_cancelacion: '2025-10-15T08:15:00.000Z',
          cancelado_por: 'Gerente',
          pagos_afectados: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede cancelar un corte cerrado',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['No se puede cancelar un corte que ya está cerrado'],
        timestamp: '2025-10-15T08:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden cancelar cortes',
  })
  @ApiResponse({ status: 404, description: 'Corte de caja no encontrado' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelCorteCajaDto: CancelCorteCajaDto,
  ) {
    return this.cortesCajaService.cancel(id, cancelCorteCajaDto);
  }
}
