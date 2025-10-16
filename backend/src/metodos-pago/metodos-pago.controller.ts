import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MetodosPagoService } from './metodos-pago.service';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';
import { FilterMetodoPagoDto } from './dto/filter-metodo-pago.dto';
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

@ApiTags('Métodos de Pago')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('metodos-pago')
export class MetodosPagoController {
  constructor(private readonly metodosPagoService: MetodosPagoService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo método de pago',
    description:
      'Registra un nuevo método de pago en el sistema: Efectivo, Tarjeta Débito/Crédito, Transferencia, Vales, etc. Permite configurar si requiere referencia (número de autorización), si requiere autorización de gerencia, comisión porcentual y estado activo/inactivo. Usado para configuración inicial del sistema y agregar nuevos métodos de cobro.',
  })
  @ApiResponse({
    status: 201,
    description: 'Método de pago creado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Método de pago creado exitosamente',
        data: {
          id_metodo_pago: 5,
          nombre: 'Tarjeta Débito',
          descripcion: 'Pago con tarjeta de débito mediante terminal bancaria',
          requiere_referencia: true,
          requiere_autorizacion: false,
          comision_porcentaje: 1.5,
          activo: true,
          icono: 'credit-card',
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
    description: 'Permiso denegado - Rol insuficiente para esta operación',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un método de pago con ese nombre',
    schema: {
      example: {
        success: false,
        code: 409,
        message: ['Ya existe un método de pago con el nombre "Tarjeta Débito"'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  create(@Body() createMetodoPagoDto: CreateMetodoPagoDto) {
    return this.metodosPagoService.create(createMetodoPagoDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Obtener todos los métodos de pago',
    description:
      'Lista todos los métodos de pago configurados en el sistema con opción de filtrar por estado activo/inactivo, si requieren referencia o autorización. Incluye estadísticas de uso si está disponible. Usado en configuración y selección de método de pago en punto de venta.',
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    description: 'Filtrar solo métodos activos (true) o inactivos (false)',
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: 'requiere_referencia',
    required: false,
    description:
      'Filtrar métodos que requieren número de referencia/autorización',
    type: Boolean,
  })
  @ApiQuery({
    name: 'requiere_autorizacion',
    required: false,
    description: 'Filtrar métodos que requieren autorización de gerencia',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de métodos de pago obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_metodo_pago: 1,
            nombre: 'Efectivo',
            requiere_referencia: false,
            comision_porcentaje: 0,
            activo: true,
          },
          {
            id_metodo_pago: 2,
            nombre: 'Tarjeta Crédito',
            requiere_referencia: true,
            comision_porcentaje: 2.5,
            activo: true,
          },
        ],
        total: 2,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterMetodoPagoDto) {
    return this.metodosPagoService.findAll(filters);
  }

  @Get('activos')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Obtener solo métodos de pago activos',
    description:
      'Retorna únicamente los métodos de pago habilitados para uso en el sistema. Lista optimizada para mostrar en punto de venta y formularios de pago. Excluye métodos desactivados o en mantenimiento.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de métodos de pago activos',
    schema: {
      example: {
        success: true,
        data: [
          { id_metodo_pago: 1, nombre: 'Efectivo', icono: 'cash' },
          { id_metodo_pago: 2, nombre: 'Tarjeta', icono: 'credit-card' },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findActivos() {
    return this.metodosPagoService.findActivos();
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener un método de pago por ID',
    description:
      'Retorna los detalles completos de un método de pago específico incluyendo configuración, comisiones y estadísticas de uso.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del método de pago',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Método de pago encontrado',
    schema: {
      example: {
        success: true,
        data: {
          id_metodo_pago: 1,
          nombre: 'Efectivo',
          descripcion: 'Pago en efectivo al momento',
          requiere_referencia: false,
          requiere_autorizacion: false,
          comision_porcentaje: 0,
          activo: true,
          icono: 'cash',
          total_pagos: 1250,
          monto_total_procesado: 458900.5,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Método de pago no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Método de pago con ID 99 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.metodosPagoService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Actualizar un método de pago',
    description:
      'Modifica la configuración de un método de pago existente: nombre, descripción, comisiones, requisitos de referencia/autorización. No afecta pagos ya registrados con este método.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del método de pago',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Método de pago actualizado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Método de pago actualizado',
        data: {
          id_metodo_pago: 2,
          nombre: 'Tarjeta Crédito/Débito',
          comision_porcentaje: 2.0,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Método de pago no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMetodoPagoDto: UpdateMetodoPagoDto,
  ) {
    return this.metodosPagoService.update(id, updateMetodoPagoDto);
  }

  @Patch(':id/toggle-activo')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Activar/Desactivar un método de pago',
    description:
      'Cambia el estado activo/inactivo de un método de pago. Los métodos inactivos no se muestran en punto de venta pero mantienen historial de transacciones. Usado para deshabilitar temporalmente métodos en mantenimiento o fuera de servicio.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del método de pago',
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado cambiado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Método de pago desactivado',
        data: {
          id_metodo_pago: 2,
          nombre: 'Tarjeta Crédito',
          activo: false,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Método de pago no encontrado' })
  toggleActivo(@Param('id', ParseIntPipe) id: number) {
    return this.metodosPagoService.toggleActivo(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un método de pago',
    description:
      'Elimina físicamente un método de pago del sistema. SOLO permite eliminación si NO tiene pagos asociados. Si hay pagos registrados, usar desactivación en su lugar. Operación irreversible, requiere rol de Administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del método de pago',
    example: 5,
  })
  @ApiResponse({
    status: 204,
    description: 'Método de pago eliminado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Solo Administrador',
  })
  @ApiResponse({ status: 404, description: 'Método de pago no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar, tiene pagos asociados',
    schema: {
      example: {
        success: false,
        code: 409,
        message: [
          'No se puede eliminar: existen 1,250 pagos registrados con este método',
        ],
        data: {
          total_pagos: 1250,
          monto_total: 458900.5,
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.metodosPagoService.remove(id);
  }
}
