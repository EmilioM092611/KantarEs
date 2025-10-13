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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Pagos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Roles('Administrador', 'Gerente', 'Cajero') //Roles de la BD
  @ApiOperation({ summary: 'Registrar un nuevo pago' })
  @ApiResponse({
    status: 201,
    description: 'Pago registrado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o monto excede el saldo pendiente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({
    status: 404,
    description: 'Orden o método de pago no encontrado',
  })
  create(@Body() createPagoDto: CreatePagoDto, @Request() req) {
    // Opcionalmente puedes sobrescribir id_usuario_cobra con el usuario autenticado
    // createPagoDto.id_usuario_cobra = req.user.id_usuario;
    return this.pagosService.create(createPagoDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener todos los pagos con filtros opcionales' })
  @ApiQuery({
    name: 'id_orden',
    required: false,
    description: 'Filtrar por ID de orden',
  })
  @ApiQuery({
    name: 'id_metodo_pago',
    required: false,
    description: 'Filtrar por método de pago',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado del pago',
  })
  @ApiQuery({
    name: 'fecha_desde',
    required: false,
    description: 'Fecha inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fecha_hasta',
    required: false,
    description: 'Fecha fin (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pagos obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterPagoDto) {
    return this.pagosService.findAll(filters);
  }

  @Get('orden/:idOrden')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({ summary: 'Obtener todos los pagos de una orden específica' })
  @ApiParam({ name: 'idOrden', description: 'ID de la orden' })
  @ApiResponse({
    status: 200,
    description: 'Pagos de la orden obtenidos exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findByOrden(@Param('idOrden', ParseIntPipe) idOrden: number) {
    return this.pagosService.findByOrden(idOrden);
  }

  @Get('orden/:idOrden/total')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({ summary: 'Obtener el total pagado de una orden' })
  @ApiParam({ name: 'idOrden', description: 'ID de la orden' })
  @ApiResponse({
    status: 200,
    description: 'Total pagado de la orden',
    schema: {
      type: 'object',
      properties: {
        total_pagado: { type: 'number', example: 500.0 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getTotalByOrden(@Param('idOrden', ParseIntPipe) idOrden: number) {
    const total = await this.pagosService.getTotalByOrden(idOrden);
    return { total_pagado: total };
  }

  @Get('reporte/diario')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener reporte de pagos del día' })
  @ApiQuery({
    name: 'fecha',
    required: false,
    description: 'Fecha del reporte (YYYY-MM-DD), por defecto hoy',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte diario generado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getReporteDiario(@Query('fecha') fecha?: string) {
    const fechaReporte = fecha ? new Date(fecha) : new Date();
    return this.pagosService.getReporteDiario(fechaReporte);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener un pago por ID' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({
    status: 200,
    description: 'Pago encontrado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Actualizar información de un pago pendiente' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({
    status: 200,
    description: 'Pago actualizado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description:
      'No se puede actualizar el pago (estado no válido o en corte cerrado)',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePagoDto: UpdatePagoDto,
  ) {
    return this.pagosService.update(id, updatePagoDto);
  }

  @Patch(':id/cancelar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Cancelar un pago' })
  @ApiParam({ name: 'id', description: 'ID del pago' })
  @ApiResponse({
    status: 200,
    description: 'Pago cancelado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description:
      'No se puede cancelar el pago (ya cancelado o en corte cerrado)',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Pago no encontrado' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelPagoDto: CancelPagoDto,
  ) {
    return this.pagosService.cancel(id, cancelPagoDto);
  }
}
