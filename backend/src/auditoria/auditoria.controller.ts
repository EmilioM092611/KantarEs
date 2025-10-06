import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { FilterAuditoriaDto } from './dto/filter-auditoria.dto';
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

@ApiTags('Auditoría del Sistema')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una acción en la auditoría' })
  @ApiResponse({
    status: 201,
    description: 'Acción registrada exitosamente en auditoría',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  create(@Body() createAuditoriaDto: CreateAuditoriaDto) {
    return this.auditoriaService.create(createAuditoriaDto);
  }

  @Get()
  @Roles('Administrador')
  @ApiOperation({
    summary:
      'Obtener todos los registros de auditoría con filtros y paginación',
  })
  @ApiQuery({
    name: 'tabla_afectada',
    required: false,
    description: 'Filtrar por nombre de tabla',
  })
  @ApiQuery({
    name: 'id_registro',
    required: false,
    description: 'Filtrar por ID de registro',
    type: Number,
  })
  @ApiQuery({
    name: 'accion',
    required: false,
    description: 'Filtrar por tipo de acción',
    enum: ['INSERT', 'UPDATE', 'DELETE'],
  })
  @ApiQuery({
    name: 'id_usuario',
    required: false,
    description: 'Filtrar por ID de usuario',
    type: Number,
  })
  @ApiQuery({
    name: 'ip_address',
    required: false,
    description: 'Filtrar por dirección IP',
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
    description: 'Lista de registros de auditoría obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  findAll(@Query() filters: FilterAuditoriaDto) {
    return this.auditoriaService.findAll(filters);
  }

  @Get('estadisticas')
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Obtener estadísticas generales de auditoría',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  getEstadisticas() {
    return this.auditoriaService.getEstadisticas();
  }

  @Get('tabla/:tabla')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener historial de cambios de una tabla específica',
  })
  @ApiParam({
    name: 'tabla',
    description: 'Nombre de la tabla',
    example: 'productos',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de registros a obtener',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de la tabla obtenido exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findByTabla(
    @Param('tabla') tabla: string,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.auditoriaService.findByTabla(tabla, limit);
  }

  @Get('tabla/:tabla/registro/:id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener historial de cambios de un registro específico',
  })
  @ApiParam({
    name: 'tabla',
    description: 'Nombre de la tabla',
    example: 'productos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial del registro obtenido exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findByTablaAndRegistro(
    @Param('tabla') tabla: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.auditoriaService.findByTablaAndRegistro(tabla, id);
  }

  @Get('usuario/:id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener acciones recientes de un usuario',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de acciones a obtener',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Acciones del usuario obtenidas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findByUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.auditoriaService.findByUsuario(id, limit);
  }

  @Get('ip/:ip')
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Obtener actividad desde una dirección IP específica',
  })
  @ApiParam({
    name: 'ip',
    description: 'Dirección IP',
    example: '192.168.1.100',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de acciones a obtener',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Actividad de la IP obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  getActividadPorIP(
    @Param('ip') ip: string,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.auditoriaService.getActividadPorIP(ip, limit);
  }

  @Get(':id/comparar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Comparar valores anteriores y nuevos de un registro de auditoría',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de auditoría',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Comparación realizada exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  compareCambios(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.compareCambios(id);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener un registro de auditoría por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de auditoría',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Registro de auditoría encontrado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.findOne(id);
  }
}
