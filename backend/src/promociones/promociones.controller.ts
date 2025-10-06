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
import { PromocionesService } from './promociones.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { FilterPromocionDto } from './dto/filter-promocion.dto';
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

@ApiTags('Promociones')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('promociones')
export class PromocionesController {
  constructor(private readonly promocionesService: PromocionesService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva promoción' })
  @ApiResponse({
    status: 201,
    description: 'Promoción creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una promoción con ese código',
  })
  create(@Body() createPromocionDto: CreatePromocionDto) {
    return this.promocionesService.create(createPromocionDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Obtener todas las promociones con filtros y paginación',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre, descripción o código',
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    description: 'Filtrar por tipo de promoción',
    enum: [
      'descuento_porcentaje',
      'descuento_monto',
      '2x1',
      '3x2',
      'precio_fijo',
      'combo',
    ],
  })
  @ApiQuery({
    name: 'aplicacion',
    required: false,
    description: 'Filtrar por aplicación',
    enum: ['producto', 'categoria', 'total_cuenta'],
  })
  @ApiQuery({
    name: 'activa',
    required: false,
    description: 'Filtrar por estado activo/inactivo',
    type: Boolean,
  })
  @ApiQuery({
    name: 'fecha_vigente',
    required: false,
    description: 'Filtrar promociones vigentes en esta fecha (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'codigo_promocion',
    required: false,
    description: 'Filtrar por código promocional',
  })
  @ApiQuery({
    name: 'combinable',
    required: false,
    description: 'Solo promociones combinables',
    type: Boolean,
  })
  @ApiQuery({
    name: 'id_producto',
    required: false,
    description: 'Filtrar por ID de producto asociado',
    type: Number,
  })
  @ApiQuery({
    name: 'id_categoria',
    required: false,
    description: 'Filtrar por ID de categoría asociada',
    type: Number,
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
    description: 'Lista de promociones obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterPromocionDto) {
    return this.promocionesService.findAll(filters);
  }

  @Get('vigentes')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Obtener solo promociones vigentes actualmente',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de promociones vigentes obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getPromocionesVigentes() {
    return this.promocionesService.getPromocionesVigentes();
  }

  @Get('codigo/:codigo')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({ summary: 'Buscar promoción por código' })
  @ApiParam({
    name: 'codigo',
    description: 'Código de la promoción',
    example: 'VERANO2025',
  })
  @ApiResponse({
    status: 200,
    description: 'Promoción encontrada',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.promocionesService.findByCodigo(codigo);
  }

  @Post('validar-codigo/:codigo')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Validar si un código de promoción es válido y puede usarse',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código de la promoción a validar',
    example: 'VERANO2025',
  })
  @ApiResponse({
    status: 200,
    description: 'Código válido',
  })
  @ApiResponse({
    status: 400,
    description: 'Código inválido, expirado o sin usos disponibles',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Código no encontrado' })
  validarCodigo(@Param('codigo') codigo: string) {
    return this.promocionesService.validarCodigo(codigo);
  }

  @Get(':id/estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener estadísticas de uso de una promoción',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  getEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.getEstadisticas(id);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({ summary: 'Obtener una promoción por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Promoción encontrada',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Actualizar una promoción' })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Promoción actualizada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otra promoción con ese código',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePromocionDto: UpdatePromocionDto,
  ) {
    return this.promocionesService.update(id, updatePromocionDto);
  }

  @Patch(':id/toggle-active')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Activar/Desactivar una promoción' })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la promoción actualizado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.toggleActive(id);
  }

  @Patch(':id/incrementar-usos')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Incrementar el contador de usos de una promoción' })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Usos incrementados exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Se alcanzó el máximo de usos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  incrementarUsos(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.incrementarUsos(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una promoción (solo si no está siendo usada en órdenes)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Promoción eliminada exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar, está siendo usada en órdenes',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.remove(id);
  }
}
