import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReservacionesService } from './reservaciones.service';
import { CreateReservacionDto } from './dto/create-reservacion.dto';
import { AsignarMesaDto } from './dto/asignar-mesa.dto';
import { EstadoReservacionDto } from './dto/estado-reservacion.dto';
import { QueryReservacionesDto } from './dto/query-reservaciones.dto';
import { DisponibilidadDto } from './dto/disponibilidad.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Reservaciones')
@ApiBearerAuth('JWT-auth')
@Controller('reservaciones')
export class ReservacionesController {
  constructor(private readonly svc: ReservacionesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una reservación (valida traslapes por mesa)',
  })
  crear(@Body() dto: CreateReservacionDto) {
    return this.svc.crear(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar reservaciones con filtros por fecha/estado/mesa',
  })
  listar(@Query() q: QueryReservacionesDto) {
    return this.svc.listar(q);
  }

  @Patch(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar una reservación' })
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
  @ApiOperation({ summary: 'Cancelar una reservación' })
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
  @ApiOperation({ summary: 'Marcar no-show (no se presentó el cliente)' })
  noShow(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<EstadoReservacionDto>,
  ) {
    return this.svc.cambiarEstado(id, { estado: 'no_show', notas: dto?.notas });
  }

  @Patch(':id/cumplida')
  @ApiOperation({ summary: 'Marcar reservación como cumplida' })
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
  @ApiOperation({ summary: 'Asignar/actualizar mesa en una reservación' })
  asignarMesa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AsignarMesaDto,
  ) {
    return this.svc.asignarMesa(id, dto);
  }

  @Get('disponibilidad')
  @ApiOperation({
    summary: 'Consultar mesas disponibles en un rango de tiempo',
  })
  disponibilidad(@Query() q: DisponibilidadDto) {
    return this.svc.disponibilidad(q);
  }
}
