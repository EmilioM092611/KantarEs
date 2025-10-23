/* eslint-disable @typescript-eslint/no-unused-vars */
// backend/src/kds/kds.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KdsService } from './kds.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CrearEstacionDto, ActualizarEstacionDto } from './dto/estacion.dto';
import {
  CambiarEstadoItemDto,
  CambiarPrioridadDto,
  MarcarAtencionDto,
} from './dto/orden-item.dto';
import { EstadisticasService } from './services/estadisticas.service';
import { TemporizadorService } from './services/temporizador.service';

@ApiTags('KDS - Kitchen Display System')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kds')
export class KdsController {
  constructor(
    private readonly kdsService: KdsService,
    private readonly estadisticasService: EstadisticasService,
    private readonly temporizadorService: TemporizadorService,
  ) {}

  // ==================== ESTACIONES ====================

  @Post('estaciones')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Crear nueva estación KDS' })
  crearEstacion(@Body() dto: CrearEstacionDto) {
    return this.kdsService.crearEstacion(dto);
  }

  @Get('estaciones')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({ summary: 'Listar todas las estaciones' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  obtenerEstaciones(@Query('activo') activo?: string) {
    const activoBool =
      activo === 'true' ? true : activo === 'false' ? false : undefined;
    return this.kdsService.obtenerEstaciones(activoBool);
  }

  @Get('estaciones/:id')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({ summary: 'Obtener estación por ID' })
  obtenerEstacion(@Param('id', ParseIntPipe) id: number) {
    return this.kdsService.obtenerEstacionPorId(id);
  }

  @Patch('estaciones/:id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Actualizar estación' })
  actualizarEstacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEstacionDto,
  ) {
    return this.kdsService.actualizarEstacion(id, dto);
  }

  @Delete('estaciones/:id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Eliminar estación' })
  eliminarEstacion(@Param('id', ParseIntPipe) id: number) {
    return this.kdsService.eliminarEstacion(id);
  }

  // ==================== TICKETS ====================

  @Get('tickets')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({ summary: 'Listar tickets activos con filtros' })
  @ApiQuery({ name: 'estacion', required: false, type: Number })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'prioridad', required: false })
  @ApiQuery({ name: 'mesa', required: false })
  @ApiQuery({ name: 'tiempo_espera_min', required: false, type: Number })
  listarTickets(@Query() filtros: any) {
    return this.kdsService.listarTickets(filtros);
  }

  @Patch('tickets/:id/listo')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({ summary: 'Marcar todos los items del ticket como listos' })
  marcarTicketListo(@Param('id', ParseIntPipe) id: number) {
    return this.kdsService.marcarTicketListo(id);
  }

  // ==================== ITEMS ====================

  @Get('items/:id')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({ summary: 'Obtener item por ID' })
  obtenerItem(@Param('id', ParseIntPipe) id: number) {
    return this.kdsService.obtenerItemPorId(id);
  }

  @Patch('items/:id/estado')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({ summary: 'Cambiar estado de un item' })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoItemDto,
  ) {
    return this.kdsService.cambiarEstadoItem(id, dto);
  }

  @Patch('items/:id/prioridad')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({ summary: 'Cambiar prioridad de un item' })
  cambiarPrioridad(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarPrioridadDto,
  ) {
    return this.kdsService.cambiarPrioridad(id, dto);
  }

  @Patch('items/:id/atencion')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({ summary: 'Marcar item como requiere atención' })
  marcarAtencion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarcarAtencionDto,
  ) {
    return this.kdsService.marcarRequiereAtencion(id, dto.requiere_atencion);
  }

  @Get('items/alertas')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({ summary: 'Obtener items con alerta de tiempo excedido' })
  @ApiQuery({ name: 'estacion', required: false, type: Number })
  obtenerAlertas(@Query('estacion') estacion?: string) {
    const estacionId = estacion ? parseInt(estacion) : undefined;
    return this.kdsService.obtenerItemsConAlerta(estacionId);
  }

  // ==================== ESTADÍSTICAS ====================

  @Get('estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener estadísticas generales del KDS' })
  obtenerEstadisticas() {
    return this.estadisticasService.obtenerEstadisticasGenerales();
  }

  @Get('estadisticas/estacion/:id')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({ summary: 'Obtener estadísticas de una estación' })
  obtenerEstadisticasEstacion(@Param('id', ParseIntPipe) id: number) {
    return this.estadisticasService.obtenerEstadisticasPorEstacion(id);
  }

  @Get('items/:id/tiempos')
  @Roles('Administrador', 'Gerente', 'Cocinero', 'Barista')
  @ApiOperation({ summary: 'Obtener tiempos de un item específico' })
  obtenerTiemposItem(@Param('id', ParseIntPipe) id: number) {
    return this.temporizadorService.obtenerTiemposItem(id);
  }
}
