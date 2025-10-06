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
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { FilterProveedorDto } from './dto/filter-proveedor.dto';
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

@ApiTags('Proveedores')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiResponse({
    status: 201,
    description: 'Proveedor creado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un proveedor con ese RFC',
  })
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(createProveedorDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener todos los proveedores con filtros y paginación',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por razón social, nombre comercial o RFC',
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    description: 'Filtrar por estado activo/inactivo',
    type: Boolean,
  })
  @ApiQuery({
    name: 'ciudad',
    required: false,
    description: 'Filtrar por ciudad',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'calificacion_min',
    required: false,
    description: 'Calificación mínima',
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
    description: 'Lista de proveedores obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterProveedorDto) {
    return this.proveedoresService.findAll(filters);
  }

  @Get('activos')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener solo proveedores activos (para selects/dropdowns)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de proveedores activos obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProveedoresActivos() {
    return this.proveedoresService.getProveedoresActivos();
  }

  @Get('rfc/:rfc')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Buscar proveedor por RFC' })
  @ApiParam({
    name: 'rfc',
    description: 'RFC del proveedor',
    example: 'DIS123456ABC',
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor encontrado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  findByRfc(@Param('rfc') rfc: string) {
    return this.proveedoresService.findByRfc(rfc);
  }

  @Get(':id/historial-compras')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener historial de compras de un proveedor',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de compras obtenido exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  getHistorialCompras(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.getHistorialCompras(id);
  }

  @Get(':id/estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener estadísticas de compras de un proveedor',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  getEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.getEstadisticas(id);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor encontrado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Actualizar un proveedor' })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor actualizado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otro proveedor con ese RFC',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProveedorDto: UpdateProveedorDto,
  ) {
    return this.proveedoresService.update(id, updateProveedorDto);
  }

  @Patch(':id/toggle-active')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Activar/Desactivar un proveedor' })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del proveedor actualizado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.toggleActive(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un proveedor (solo si no tiene compras asociadas)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Proveedor eliminado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar, tiene compras asociadas',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.remove(id);
  }
}
