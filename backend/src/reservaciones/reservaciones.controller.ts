/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReservacionesService } from './services/reservaciones.service';
import {
  DisponibilidadQueryDto,
  CalendarioQueryDto,
  BloquearMesaDto,
  HistorialClienteQueryDto,
  ConfirmarReservacionDto,
} from './dto/gestion-avanzada.dto';
import {
  CreateListaEsperaDto,
  UpdateListaEsperaDto,
  NotificarListaEsperaDto,
} from './dto/lista-espera.dto';
import { CreateReservacionMejoradaDto } from './dto/create-reservacion-mejorada.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reservaciones - Gestión Avanzada')
@ApiBearerAuth('JWT-auth')
@Controller('reservaciones')
@UseGuards(JwtAuthGuard)
export class ReservacionesController {
  constructor(private readonly service: ReservacionesService) {}

  // =====================================================
  // 7.1 GESTIÓN AVANZADA
  // =====================================================

  @Get('disponibilidad')
  @ApiOperation({
    summary: 'Consultar disponibilidad de mesas',
    description:
      'Verifica qué mesas están disponibles para una fecha, hora y número de personas específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mesas con disponibilidad',
  })
  async consultarDisponibilidad(@Query() query: DisponibilidadQueryDto) {
    return this.service.consultarDisponibilidad(query);
  }

  @Post('bloquearmesa')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Bloquear mesa para mantenimiento o eventos',
    description:
      'Crea un bloqueo en una mesa para que no pueda ser reservada en el horario especificado',
  })
  @ApiResponse({
    status: 201,
    description: 'Mesa bloqueada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Conflicto de horario o datos inválidos',
  })
  async bloquearMesa(@Body() dto: BloquearMesaDto) {
    return this.service.bloquearMesa(dto);
  }

  @Get('calendario')
  @ApiOperation({
    summary: 'Obtener calendario mensual de reservaciones',
    description: 'Retorna todas las reservaciones del mes agrupadas por día',
  })
  @ApiResponse({
    status: 200,
    description: 'Calendario mensual con reservaciones',
  })
  async obtenerCalendario(@Query() query: CalendarioQueryDto) {
    return this.service.obtenerCalendario(query.mes, query.anio);
  }

  @Post('confirmar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar reservación',
    description:
      'Permite al cliente confirmar su reservación y actualizar datos de contacto',
  })
  @ApiResponse({
    status: 200,
    description: 'Reservación confirmada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservación no encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'La reservación ya ha sido confirmada',
  })
  async confirmarReservacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto?: ConfirmarReservacionDto,
  ) {
    return this.service.confirmarReservacion(id, dto);
  }

  @Post('recordatorio/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar recordatorio manual',
    description:
      'Envía un recordatorio inmediato al cliente por el método de contacto preferido',
  })
  @ApiResponse({
    status: 200,
    description: 'Recordatorio enviado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservación no encontrada',
  })
  async enviarRecordatorio(@Param('id', ParseIntPipe) id: number) {
    return this.service.enviarRecordatorio(id);
  }

  @Get('historial-cliente')
  @ApiOperation({
    summary: 'Obtener historial de reservaciones de un cliente',
    description:
      'Retorna el historial completo de reservaciones y estadísticas del cliente',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial del cliente',
  })
  async obtenerHistorialCliente(@Query() query: HistorialClienteQueryDto) {
    return this.service.obtenerHistorialCliente(
      query.telefono,
      query.limite || 20,
    );
  }

  // =====================================================
  // 7.3 LISTA DE ESPERA
  // =====================================================

  @Post('lista-espera')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar cliente a lista de espera',
    description:
      'Registra un cliente en lista de espera cuando no hay mesas disponibles',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente agregado a lista de espera',
  })
  async agregarListaEspera(@Body() dto: CreateListaEsperaDto) {
    return this.service.agregarListaEspera(dto);
  }

  @Get('lista-espera/activa')
  @ApiOperation({
    summary: 'Obtener lista de espera activa',
    description:
      'Retorna todos los clientes en espera ordenados por tiempo de llegada',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de espera activa con posiciones y tiempos',
  })
  async obtenerListaEsperaActiva() {
    return this.service.obtenerListaEsperaActiva();
  }

  @Patch('lista-espera/:id/notificar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Notificar cliente en lista de espera',
    description: 'Envía notificación al cliente cuando su mesa está lista',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente notificado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Entrada no encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'La entrada ya no está activa',
  })
  async notificarListaEspera(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto?: NotificarListaEsperaDto,
  ) {
    return this.service.notificarListaEspera(id, dto);
  }

  @Patch('lista-espera/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar entrada en lista de espera',
    description: 'Permite actualizar el estado y datos de la lista de espera',
  })
  @ApiResponse({
    status: 200,
    description: 'Entrada actualizada',
  })
  async actualizarListaEspera(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListaEsperaDto,
  ) {
    // Implementar lógica de actualización si es necesario
    throw new Error('Método no implementado');
  }

  @Delete('lista-espera/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar cliente de lista de espera',
    description:
      'Marca la entrada como cancelada y la remueve de la lista activa',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente eliminado de lista de espera',
  })
  @ApiResponse({
    status: 404,
    description: 'Entrada no encontrada',
  })
  async eliminarDeListaEspera(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminarDeListaEspera(id);
  }

  @Patch('lista-espera/:id/atendido')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar como atendido en lista de espera',
    description:
      'Marca la entrada como atendida cuando el cliente es asignado a una mesa',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente marcado como atendido',
  })
  async marcarComoAtendido(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarComoAtendido(id);
  }

  // =====================================================
  // CRUD BÁSICO (mantener compatibilidad)
  // =====================================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear reservación (versión mejorada)',
    description:
      'Crea una nueva reservación con campos adicionales para notificaciones',
  })
  @ApiResponse({
    status: 201,
    description: 'Reservación creada exitosamente',
  })
  async crearReservacion(@Body() dto: CreateReservacionMejoradaDto) {
    // Implementar lógica de creación mejorada
    throw new Error('Implementar con el servicio');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener reservación por ID',
  })
  async obtenerReservacion(@Param('id', ParseIntPipe) id: number) {
    throw new Error('Implementar con el servicio');
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las reservaciones',
  })
  async listarReservaciones(
    @Query('estado') estado?: string,
    @Query('fecha_desde') fecha_desde?: string,
    @Query('fecha_hasta') fecha_hasta?: string,
  ) {
    throw new Error('Implementar con el servicio');
  }
}
