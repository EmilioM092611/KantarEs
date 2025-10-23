/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { SesionesMesaService } from './sesiones-mesas.service';
import { AbrirSesionDto } from './dto/abrir-sesion.dto';
import { CerrarSesionDto } from './dto/cerrar-sesion.dto';
import { TransferirMesaDto } from './dto/transferir-mesa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Sesiones Mesa')
@ApiBearerAuth('JWT-auth')
@Controller('sesiones-mesa')
@UseGuards(JwtAuthGuard)
export class SesionesMesaController {
  constructor(private readonly sesionesMesaService: SesionesMesaService) {}

  @Post('abrir')
  @ApiOperation({
    summary: 'Abrir sesión de mesa',
    description:
      'Abre una nueva sesión para una mesa. Valida que la mesa esté disponible y no tenga sesión activa. Cambia estado de mesa a "Ocupada". Usado al sentar clientes.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sesión abierta exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Mesa no disponible o ya tiene sesión activa',
  })
  async abrirSesion(@Body() abrirSesionDto: AbrirSesionDto, @Request() req) {
    const sesion = await this.sesionesMesaService.abrirSesion(
      abrirSesionDto,
      req.user.id_usuario,
    );
    return {
      success: true,
      message: 'Sesión abierta exitosamente',
      data: sesion,
    };
  }

  @Patch(':id/cerrar')
  @ApiOperation({
    summary: 'Cerrar sesión de mesa',
    description:
      'Cierra una sesión de mesa activa. Valida que no haya órdenes pendientes de pago. Cambia estado de mesa a "Por limpiar". Calcula tiempo total de sesión y consumo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Sesión tiene órdenes pendientes de pago',
  })
  async cerrarSesion(
    @Param('id', ParseIntPipe) id: number,
    @Body() cerrarSesionDto: CerrarSesionDto,
    @Request() req,
  ) {
    // ✅ CORRECCIÓN: Orden correcto de parámetros (id, userId, dto)
    const sesion = await this.sesionesMesaService.cerrarSesion(
      id,
      req.user.id_usuario,
      cerrarSesionDto,
    );
    return {
      success: true,
      message: 'Sesión cerrada exitosamente',
      data: sesion,
    };
  }

  @Patch(':id/pausar')
  @ApiOperation({
    summary: 'Pausar sesión de mesa',
    description:
      'Pausa temporalmente una sesión (ej: cliente sale a fumar). Estado de mesa cambia a "Pausada". Permite reanudar después. Usado para mesas temporalmente desocupadas.',
  })
  async pausarSesion(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const sesion = await this.sesionesMesaService.pausarSesion(
      id,
      req.user.id_usuario,
    );
    return {
      success: true,
      message: 'Sesión pausada exitosamente',
      data: sesion,
    };
  }

  @Patch(':id/reanudar')
  @ApiOperation({
    summary: 'Reanudar sesión pausada',
    description:
      'Reactiva una sesión que estaba pausada. Cambia estado a "Abierta" nuevamente. Registra tiempo de pausa. Usado cuando clientes regresan a la mesa.',
  })
  async reanudarSesion(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const sesion = await this.sesionesMesaService.reanudarSesion(
      id,
      req.user.id_usuario,
    );
    return {
      success: true,
      message: 'Sesión reanudada exitosamente',
      data: sesion,
    };
  }

  @Patch(':id/transferir')
  @ApiOperation({
    summary: 'Transferir sesión a otra mesa',
    description:
      'Transfiere sesión activa de una mesa a otra. Valida que mesa destino esté disponible. Actualiza estado de ambas mesas. Mantiene órdenes asociadas. Usado al cambiar clientes de mesa.',
  })
  async transferirMesa(
    @Param('id', ParseIntPipe) id: number,
    @Body() transferirDto: TransferirMesaDto,
    @Request() req,
  ) {
    const sesion = await this.sesionesMesaService.transferirMesa(
      id,
      transferirDto,
      req.user.id_usuario,
    );
    return {
      success: true,
      message: 'Mesa transferida exitosamente',
      data: sesion,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las sesiones',
    description:
      'Obtiene lista de todas las sesiones con filtros opcionales. Incluye información de mesa, mesero, órdenes y consumo total. Usado para monitoreo general del restaurante.',
  })
  async findAll() {
    const sesiones = await this.sesionesMesaService.findAll();
    return {
      success: true,
      data: sesiones,
    };
  }

  @Get('activas')
  @ApiOperation({
    summary: 'Listar sesiones activas',
    description:
      'Retorna solo sesiones en estado "Abierta". Incluye tiempo transcurrido y consumo actual. Usado en dashboard de mesas ocupadas.',
  })
  async findActivas() {
    const sesiones = await this.sesionesMesaService.findActivas();
    return {
      success: true,
      data: sesiones,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de sesión',
    description:
      'Retorna información completa de una sesión: mesa, mesero, comensales, todas las órdenes asociadas, pagos, consumo total, tiempo transcurrido. Usado para consulta detallada.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const sesion = await this.sesionesMesaService.findOne(id);
    return {
      success: true,
      data: sesion,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancelar sesión',
    description:
      'Cancela una sesión de mesa. Solo permite cancelar si no hay órdenes procesadas. Requiere motivo obligatorio. Libera mesa. Usado para cancelaciones por error o cliente que no llega.',
  })
  async cancelarSesion(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const sesion = await this.sesionesMesaService.cancelarSesion(
      id,
      req.user.id_usuario,
    );
    return {
      success: true,
      message: 'Sesión cancelada exitosamente',
      data: sesion,
    };
  }
}
