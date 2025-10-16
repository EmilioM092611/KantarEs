/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller as Controller2,
  Get as Get2,
  Post as Post2,
  Body as Body2,
  Patch as Patch2,
  Param as Param2,
  Query as Query2,
  UseGuards as UseGuards2,
  ParseIntPipe as ParseIntPipe2,
  HttpStatus as HttpStatus2,
  HttpCode as HttpCode2,
  Request as Request2,
  BadRequestException,
} from '@nestjs/common';
import { SesionesMesaService } from './sesiones-mesas.service';
import { AbrirSesionDto } from './dto/abrir-sesion.dto';
import { CerrarSesionDto } from './dto/cerrar-sesion.dto';
import { ActualizarSesionDto } from './dto/actualizar-sesion.dto';
import { TransferirMesaDto } from './dto/transferir-mesa.dto';
import { QuerySesionesDto } from './dto/query-sesiones.dto';
import { JwtAuthGuard as JwtAuthGuard2 } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth as ApiBearerAuth2,
  ApiTags as ApiTags2,
  ApiOperation as ApiOperation2,
  ApiResponse as ApiResponse2,
  ApiParam as ApiParam2,
} from '@nestjs/swagger';

@ApiTags2('Sesiones de Mesa')
@ApiBearerAuth2('JWT-auth')
@Controller2('sesiones-mesa')
@UseGuards2(JwtAuthGuard2)
export class SesionesMesaController {
  constructor(private readonly sesionesMesaService: SesionesMesaService) {}

  @Post2('abrir')
  @HttpCode2(HttpStatus2.CREATED)
  @ApiOperation2({
    summary: 'Abrir nueva sesión de mesa',
    description:
      'Inicia una sesión en una mesa disponible. Registra hostess/mesero que abre, número de comensales y nombre del cliente. Cambia estado de mesa a Ocupada automáticamente. Valida que la mesa no tenga sesión activa.',
  })
  @ApiResponse2({
    status: 201,
    description: 'Sesión abierta exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Sesión abierta exitosamente',
        data: {
          id_sesion: 123,
          id_mesa: 15,
          numero_mesa: 'M-15',
          numero_comensales: 4,
          nombre_cliente: 'Juan Pérez',
          fecha_hora_apertura: '2025-10-15T20:00:00.000Z',
          estado: 'abierta',
          usuario_apertura: 'María López',
        },
      },
    },
  })
  @ApiResponse2({
    status: 400,
    description: 'La mesa ya tiene una sesión activa',
  })
  @ApiResponse2({
    status: 404,
    description: 'Mesa no encontrada o inactiva',
  })
  async abrirSesion(@Body2() abrirSesionDto: AbrirSesionDto, @Request2() req) {
    const sesion = await this.sesionesMesaService.abrirSesion(
      abrirSesionDto,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Sesión abierta exitosamente',
      data: sesion,
    };
  }

  @Patch2(':id/cerrar')
  @ApiOperation2({
    summary: 'Cerrar sesión de mesa',
    description:
      'Finaliza una sesión activa. Registra usuario que cierra y validaciones: todas las órdenes deben estar pagadas, no debe haber cuenta pendiente. Libera la mesa cambiando su estado a Disponible o Requiere Limpieza.',
  })
  @ApiParam2({
    name: 'id',
    description: 'ID de la sesión',
    example: 123,
  })
  @ApiResponse2({
    status: 200,
    description: 'Sesión cerrada exitosamente',
  })
  @ApiResponse2({
    status: 400,
    description: 'No se puede cerrar: hay órdenes sin pagar',
  })
  async cerrarSesion(
    @Param2('id', ParseIntPipe2) id: number,
    @Body2() cerrarSesionDto: CerrarSesionDto,
    @Request2() req,
  ) {
    const sesion = await this.sesionesMesaService.cerrarSesion(
      id,
      req.user.userId,
      cerrarSesionDto,
    );
    return {
      success: true,
      message: 'Sesión cerrada exitosamente',
      data: sesion,
    };
  }

  @Get2('activas')
  @ApiOperation2({
    summary: 'Listar sesiones activas',
    description:
      'Obtiene todas las sesiones en estado abierto con información de mesa, comensales, tiempo transcurrido y órdenes. Vista principal para meseros y gerencia.',
  })
  @ApiResponse2({
    status: 200,
    description: 'Lista de sesiones activas',
  })
  async getActivas() {
    const sesiones = await this.sesionesMesaService.getActivas();
    return {
      success: true,
      data: sesiones,
    };
  }

  @Get2('buscar')
  @ApiOperation2({
    summary: 'Buscar sesiones con filtros',
    description:
      'Búsqueda avanzada de sesiones por estado, fecha, mesa, usuario o nombre de cliente. Soporta rangos de fecha para reportes históricos.',
  })
  @ApiResponse2({
    status: 200,
    description: 'Sesiones encontradas según filtros',
  })
  async buscar(@Query2() query: QuerySesionesDto) {
    const sesiones = await this.sesionesMesaService.buscar(query);
    return {
      success: true,
      data: sesiones,
    };
  }

  @Get2('mesa/:mesaId')
  @ApiOperation2({
    summary: 'Obtener sesión actual de una mesa',
    description:
      'Retorna la sesión activa de una mesa específica o null si está disponible. Usado para validaciones y consultas rápidas de estado.',
  })
  @ApiParam2({
    name: 'mesaId',
    description: 'ID de la mesa',
    example: 15,
  })
  @ApiResponse2({
    status: 200,
    description: 'Sesión actual de la mesa o null',
  })
  async getSesionByMesa(@Param2('mesaId', ParseIntPipe2) mesaId: number) {
    const sesion = await this.sesionesMesaService.getSesionByMesa(mesaId);
    return {
      success: true,
      data: sesion,
    };
  }

  @Get2(':id')
  @ApiOperation2({
    summary: 'Obtener detalle de sesión',
    description:
      'Información completa de una sesión: datos básicos, todas las órdenes asociadas, pagos realizados, tiempo transcurrido y total consumido.',
  })
  @ApiParam2({
    name: 'id',
    description: 'ID de la sesión',
    example: 123,
  })
  @ApiResponse2({
    status: 200,
    description: 'Detalle completo de la sesión',
  })
  @ApiResponse2({
    status: 404,
    description: 'Sesión no encontrada',
  })
  async findOne(@Param2('id', ParseIntPipe2) id: number) {
    const sesion = await this.sesionesMesaService.findOne(id);
    return {
      success: true,
      data: sesion,
    };
  }

  @Get2(':id/resumen')
  @ApiOperation2({
    summary: 'Obtener resumen completo de sesión',
    description:
      'Dashboard de la sesión: todas las órdenes con detalle, desglose de pagos, saldo pendiente, propinas, tiempo total y consumo promedio por comensal. Usado para cierre de cuenta.',
  })
  @ApiParam2({
    name: 'id',
    description: 'ID de la sesión',
    example: 123,
  })
  @ApiResponse2({
    status: 200,
    description: 'Resumen financiero y operativo de la sesión',
  })
  async getResumen(@Param2('id', ParseIntPipe2) id: number) {
    const resumen = await this.sesionesMesaService.getResumen(id);
    return {
      success: true,
      data: resumen,
    };
  }

  @Patch2(':id/comensales')
  @ApiOperation2({
    summary: 'Actualizar número de comensales',
    description:
      'Ajusta el número de comensales en una sesión activa. Usado cuando llegan o se retiran personas de la mesa.',
  })
  @ApiParam2({
    name: 'id',
    description: 'ID de la sesión',
    example: 123,
  })
  @ApiResponse2({
    status: 200,
    description: 'Comensales actualizados',
  })
  async actualizarComensales(
    @Param2('id', ParseIntPipe2) id: number,
    @Body2() dto: ActualizarSesionDto,
  ) {
    if (!dto.numero_comensales) {
      throw new BadRequestException(
        'Debe proporcionar el número de comensales',
      );
    }

    const sesion = await this.sesionesMesaService.actualizarComensales(
      id,
      dto.numero_comensales,
    );
    return {
      success: true,
      message: 'Comensales actualizados',
      data: sesion,
    };
  }

  @Patch2(':id/transferir')
  @ApiOperation2({
    summary: 'Transferir sesión a otra mesa',
    description:
      'Mueve una sesión activa con todas sus órdenes a otra mesa disponible. Actualiza estados de ambas mesas. Registra usuario que autoriza la transferencia. Usado cuando se requiere cambiar de mesa por capacidad o preferencia del cliente.',
  })
  @ApiParam2({
    name: 'id',
    description: 'ID de la sesión',
    example: 123,
  })
  @ApiResponse2({
    status: 200,
    description: 'Sesión transferida exitosamente',
  })
  @ApiResponse2({
    status: 400,
    description: 'La mesa destino no está disponible',
  })
  async transferirMesa(
    @Param2('id', ParseIntPipe2) id: number,
    @Body2() transferirDto: TransferirMesaDto,
    @Request2() req,
  ) {
    const sesion = await this.sesionesMesaService.transferirMesa(
      id,
      transferirDto,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Sesión transferida exitosamente',
      data: sesion,
    };
  }

  @Patch2(':id/pausar')
  @ApiOperation2({
    summary: 'Pausar sesión',
    description:
      'Pone la sesión en estado pausado temporalmente. La mesa queda en espera sin liberarse. Usado en casos especiales como espera de cliente que salió momentáneamente.',
  })
  @ApiParam2({
    name: 'id',
    description: 'ID de la sesión',
    example: 123,
  })
  @ApiResponse2({
    status: 200,
    description: 'Sesión pausada',
  })
  async pausarSesion(@Param2('id', ParseIntPipe2) id: number, @Request2() req) {
    const sesion = await this.sesionesMesaService.pausarSesion(
      id,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Sesión pausada',
      data: sesion,
    };
  }

  @Post2(':id/reanudar')
  @ApiOperation2({
    summary: 'Reanudar sesión pausada',
    description:
      'Reactiva una sesión que estaba en pausa, volviendo a estado abierto. Registra usuario que reanuda.',
  })
  @ApiParam2({
    name: 'id',
    description: 'ID de la sesión',
    example: 123,
  })
  @ApiResponse2({
    status: 200,
    description: 'Sesión reanudada',
  })
  async reanudarSesion(
    @Param2('id', ParseIntPipe2) id: number,
    @Request2() req,
  ) {
    const sesion = await this.sesionesMesaService.reanudarSesion(
      id,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Sesión reanudada',
      data: sesion,
    };
  }
}
