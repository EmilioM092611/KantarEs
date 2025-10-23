import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { MesasService } from './mesas.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { CambiarEstadoMesaDto } from './dto/cambiar-estado-mesa.dto';
import { QueryMesasDto } from './dto/query-mesas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Mesas')
@ApiBearerAuth('JWT-auth')
@Controller('mesas')
@UseGuards(JwtAuthGuard)
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva mesa',
    description:
      'Registra una nueva mesa en el sistema con su número, capacidad, ubicación física (coordenadas X,Y), planta y estado inicial. Soporta distribución visual en mapa de mesas para hostess y meseros.',
  })
  @ApiResponse({
    status: 201,
    description: 'Mesa creada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Mesa creada exitosamente',
        data: {
          id_mesa: 15,
          numero_mesa: 'M-15',
          capacidad_personas: 4,
          ubicacion: 'Terraza',
          planta: 2,
          coordenada_x: 100,
          coordenada_y: 50,
          id_estado_mesa: 1,
          estado: 'Disponible',
          activa: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una mesa con ese número',
  })
  async create(@Body() createMesaDto: CreateMesaDto) {
    const mesa = await this.mesasService.create(createMesaDto);
    return {
      success: true,
      message: 'Mesa creada exitosamente',
      data: mesa,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las mesas',
    description:
      'Obtiene listado de mesas con filtros opcionales por estado, planta, capacidad y disponibilidad. Incluye información de sesión activa y estado en tiempo real para gestión de salón.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mesas con estados actuales',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_mesa: 15,
            numero_mesa: 'M-15',
            capacidad_personas: 4,
            estado: 'Ocupada',
            sesion_activa: true,
            comensales_actuales: 3,
            tiempo_ocupacion: '45 minutos',
          },
        ],
      },
    },
  })
  async findAll(@Query() query: QueryMesasDto) {
    const mesas = await this.mesasService.findAll(query);
    return {
      success: true,
      data: mesas,
    };
  }

  @Get('disponibles')
  @ApiOperation({
    summary: 'Listar solo mesas disponibles',
    description:
      'Retorna únicamente mesas en estado disponible y sin sesión activa. Usado por hostess para asignación rápida de mesas a clientes que llegan.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mesas disponibles para asignar',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_mesa: 15,
            numero_mesa: 'M-15',
            capacidad_personas: 4,
            ubicacion: 'Terraza',
          },
        ],
        total_disponibles: 8,
      },
    },
  })
  async findDisponibles() {
    const mesas = await this.mesasService.findDisponibles();
    return {
      success: true,
      data: mesas,
    };
  }

  @Get('mapa')
  @ApiOperation({
    summary: 'Obtener mesas para vista de mapa',
    description:
      'Retorna todas las mesas con coordenadas X,Y, estado actual y sesión activa. Usado para renderizar el mapa visual del restaurante en tiempo real con colores por estado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos de mesas con coordenadas para mapa visual',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_mesa: 15,
            numero_mesa: 'M-15',
            coordenada_x: 100,
            coordenada_y: 50,
            estado: 'Ocupada',
            color: '#FF6B6B',
            sesion_id: 45,
          },
        ],
      },
    },
  })
  async getMapa() {
    const mesas = await this.mesasService.getMapa();
    return {
      success: true,
      data: mesas,
    };
  }

  @Get('estadisticas')
  @ApiOperation({
    summary: 'Obtener estadísticas de mesas',
    description:
      'Dashboard de métricas: total de mesas, distribución por estado, tasa de ocupación actual, promedio de tiempo por mesa y rotación. KPIs clave para gerencia.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas y KPIs de mesas',
  })
  async getEstadisticas() {
    const stats = await this.mesasService.getEstadisticas();
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de una mesa',
    description:
      'Información completa de una mesa: datos básicos, estado actual, sesión activa (si existe), historial reciente y estadísticas de uso.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la mesa',
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle completo de la mesa',
  })
  @ApiResponse({
    status: 404,
    description: 'Mesa no encontrada',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const mesa = await this.mesasService.findOne(id);
    return {
      success: true,
      data: mesa,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar mesa',
    description:
      'Modifica configuración de la mesa: capacidad, ubicación, coordenadas o planta. No cambia el estado operativo (usar endpoint específico).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la mesa',
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Mesa actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Mesa no encontrada',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMesaDto: UpdateMesaDto,
  ) {
    const mesa = await this.mesasService.update(id, updateMesaDto);
    return {
      success: true,
      message: 'Mesa actualizada exitosamente',
      data: mesa,
    };
  }

  @Patch(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado de mesa',
    description:
      'Cambia el estado operativo de la mesa: Disponible, Ocupada, Reservada, Por limpiar y En mantenimiento . Valida transiciones permitidas según estado actual.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la mesa',
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
  })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado no permitida',
  })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoMesaDto,
  ) {
    const mesa = await this.mesasService.cambiarEstado(id, cambiarEstadoDto);
    return {
      success: true,
      message: 'Estado de mesa actualizado',
      data: mesa,
    };
  }

  @Patch(':id/limpiar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar mesa como limpia',
    description:
      'Marca la mesa como limpia y la pone en estado Disponible. Usado por personal de limpieza después de desocupar una mesa.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la mesa',
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Mesa marcada como limpia y disponible',
  })
  async limpiarMesa(@Param('id', ParseIntPipe) id: number) {
    const mesa = await this.mesasService.limpiarMesa(id);
    return {
      success: true,
      message: 'Mesa marcada como limpia',
      data: mesa,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Desactivar mesa (soft delete)',
    description:
      'Desactiva una mesa del sistema sin eliminarla. No se puede desactivar si tiene sesión activa. Usado para mesas fuera de servicio temporalmente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la mesa',
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Mesa desactivada',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede desactivar, tiene sesión activa',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.mesasService.remove(id);
    return {
      success: true,
      message: 'Mesa desactivada exitosamente',
    };
  }
}
