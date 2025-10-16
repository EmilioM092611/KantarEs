import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReservacionesService } from './reservaciones.service';
import { CreateReservacionDto } from './dto/create-reservacion.dto';
import { AsignarMesaDto } from './dto/asignar-mesa.dto';
import { EstadoReservacionDto } from './dto/estado-reservacion.dto';
import { QueryReservacionesDto } from './dto/query-reservaciones.dto';
import { DisponibilidadDto } from './dto/disponibilidad.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reservaciones')
@ApiBearerAuth('JWT-auth')
@Controller('reservaciones')
@UseGuards(JwtAuthGuard)
export class ReservacionesController {
  constructor(private readonly svc: ReservacionesService) {}

  // === MEJORA 9: Validación de traslapes garantizada ===

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Crear una reservación (valida traslapes por mesa automáticamente)',
    description:
      'Crea reservación validando que no haya traslapes de horario en la mesa',
  })
  @ApiResponse({
    status: 201,
    description: 'Reservación creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Traslape de horario detectado o rango inválido',
  })
  crear(@Body() dto: CreateReservacionDto) {
    return this.svc.crear(dto);
  }

  @Post('validar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar disponibilidad antes de crear reservación',
    description:
      'Verifica si hay conflictos de horario para la mesa especificada',
  })
  @ApiResponse({
    status: 200,
    description: 'Validación completada, retorna conflictos si existen',
  })
  async validarDisponibilidad(
    @Body()
    dto: {
      id_mesa: number;
      fecha_inicio: string;
      fecha_fin: string;
    },
  ) {
    const conflictos = await this.svc.validarTraslape(
      dto.id_mesa,
      dto.fecha_inicio,
      dto.fecha_fin,
    );

    return {
      success: true,
      disponible: conflictos.length === 0,
      conflictos,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar reservaciones con filtros por fecha/estado/mesa',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de reservaciones filtradas',
  })
  listar(@Query() q: QueryReservacionesDto) {
    return this.svc.listar(q);
  }

  @Get('disponibilidad')
  @ApiOperation({
    summary: 'Consultar mesas disponibles en un rango de tiempo',
    description:
      'Retorna mesas sin reservas ni sesiones activas en el período especificado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mesas disponibles',
  })
  @ApiResponse({
    status: 400,
    description: 'Rango de fechas inválido',
  })
  disponibilidad(@Query() q: DisponibilidadDto) {
    return this.svc.disponibilidad(q);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de una reservación',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la reservación',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservación no encontrada',
  })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const reservacion = await this.svc.findOne(id);
    return {
      success: true,
      data: reservacion,
    };
  }

  @Patch(':id/confirmar')
  @ApiOperation({
    summary: 'Confirmar una reservación pendiente',
  })
  @ApiResponse({
    status: 200,
    description: 'Reservación confirmada',
  })
  confirmar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<EstadoReservacionDto>,
  ) {
    return this.svc.cambiarEstado(id, {
      estado: 'confirmada',
      notas: dto?.notas,
    });
  }

  @Patch(':id/cancelar')
  @ApiOperation({
    summary: 'Cancelar una reservación',
  })
  @ApiResponse({
    status: 200,
    description: 'Reservación cancelada',
  })
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<EstadoReservacionDto>,
  ) {
    return this.svc.cambiarEstado(id, {
      estado: 'cancelada',
      notas: dto?.notas,
    });
  }

  @Patch(':id/no-show')
  @ApiOperation({
    summary: 'Marcar no-show (cliente no se presentó)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reservación marcada como no-show',
  })
  noShow(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<EstadoReservacionDto>,
  ) {
    return this.svc.cambiarEstado(id, { estado: 'no_show', notas: dto?.notas });
  }

  @Patch(':id/cumplida')
  @ApiOperation({
    summary: 'Marcar reservación como cumplida',
  })
  @ApiResponse({
    status: 200,
    description: 'Reservación cumplida',
  })
  cumplida(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<EstadoReservacionDto>,
  ) {
    return this.svc.cambiarEstado(id, {
      estado: 'cumplida',
      notas: dto?.notas,
    });
  }

  @Patch(':id/asignar-mesa')
  @ApiOperation({
    summary: 'Asignar/actualizar mesa en una reservación',
    description: 'Valida que no haya traslapes antes de asignar',
  })
  @ApiResponse({
    status: 200,
    description: 'Mesa asignada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Mesa ya ocupada en ese horario',
  })
  asignarMesa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarMesaDto,
  ) {
    return this.svc.asignarMesa(id, dto);
  }
}
