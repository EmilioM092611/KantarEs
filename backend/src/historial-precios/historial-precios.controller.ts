import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { HistorialPreciosService } from './historial-precios.service';
import { CreateHistorialPrecioDto } from './dto/create-historial-precio.dto';
import { FilterHistorialPrecioDto } from './dto/filter-historial-precio.dto';
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

@ApiTags('Historial de Precios')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('historial-precios')
export class HistorialPreciosController {
  constructor(
    private readonly historialPreciosService: HistorialPreciosService,
  ) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un cambio de precio de producto' })
  @ApiResponse({
    status: 201,
    description: 'Cambio de precio registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Producto o usuario no encontrado' })
  create(@Body() createHistorialPrecioDto: CreateHistorialPrecioDto) {
    return this.historialPreciosService.create(createHistorialPrecioDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener todos los cambios de precio con filtros y paginación',
  })
  @ApiQuery({
    name: 'id_producto',
    required: false,
    description: 'Filtrar por ID de producto',
    type: Number,
  })
  @ApiQuery({
    name: 'id_usuario_modifica',
    required: false,
    description: 'Filtrar por ID de usuario que realizó el cambio',
    type: Number,
  })
  @ApiQuery({
    name: 'fecha_desde',
    required: false,
    description: 'Fecha desde (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fecha_hasta',
    required: false,
    description: 'Fecha hasta (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Resultados por página',
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo por el que ordenar',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Orden ascendente o descendente',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cambios de precio obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterHistorialPrecioDto) {
    return this.historialPreciosService.findAll(filters);
  }

  @Get('producto/:id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener todo el historial de precios de un producto',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de precios del producto obtenido exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findByProducto(@Param('id', ParseIntPipe) id: number) {
    return this.historialPreciosService.findByProducto(id);
  }

  @Get('producto/:id/precio-en-fecha')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener el precio vigente de un producto en una fecha específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    type: Number,
  })
  @ApiQuery({
    name: 'fecha',
    description: 'Fecha de consulta (YYYY-MM-DD)',
    example: '2025-06-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Precio vigente obtenido exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró precio vigente en esa fecha',
  })
  getPrecioEnFecha(
    @Param('id', ParseIntPipe) id: number,
    @Query('fecha') fecha: string,
  ) {
    return this.historialPreciosService.getPrecioEnFecha(id, fecha);
  }

  @Get('producto/:id/estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener estadísticas de cambios de precio de un producto',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  getEstadisticasProducto(@Param('id', ParseIntPipe) id: number) {
    return this.historialPreciosService.getEstadisticasProducto(id);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener un registro de historial por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de historial',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Registro de historial encontrado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historialPreciosService.findOne(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un registro de historial de precio' })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de historial',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Registro eliminado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historialPreciosService.remove(id);
  }
}
