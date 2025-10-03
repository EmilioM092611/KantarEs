import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MovimientosInventarioService } from './movimientos-inventario.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { FilterMovimientoDto } from './dto/filter-movimiento.dto';
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

@ApiTags('Movimientos de Inventario')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movimientos-inventario')
export class MovimientosInventarioController {
  constructor(
    private readonly movimientosInventarioService: MovimientosInventarioService,
  ) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Registrar un movimiento de inventario (entrada, salida o ajuste)',
  })
  @ApiResponse({
    status: 201,
    description: 'Movimiento registrado y stock actualizado',
  })
  @ApiResponse({
    status: 400,
    description: 'Stock insuficiente o producto no inventariable',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({
    status: 404,
    description: 'Tipo de movimiento, producto o usuario no encontrado',
  })
  create(@Body() createMovimientoDto: CreateMovimientoDto) {
    return this.movimientosInventarioService.create(createMovimientoDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener todos los movimientos con filtros opcionales',
  })
  @ApiQuery({ name: 'id_producto', required: false })
  @ApiQuery({ name: 'id_tipo_movimiento', required: false })
  @ApiQuery({ name: 'id_usuario', required: false })
  @ApiQuery({ name: 'id_compra', required: false })
  @ApiQuery({ name: 'id_orden', required: false })
  @ApiQuery({
    name: 'afecta',
    required: false,
    enum: ['suma', 'resta', 'ajuste'],
  })
  @ApiQuery({ name: 'fecha_desde', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'fecha_hasta', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'lote', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de movimientos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterMovimientoDto) {
    return this.movimientosInventarioService.findAll(filters);
  }

  @Get('recientes')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener los movimientos más recientes' })
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Cantidad de movimientos a retornar',
  })
  @ApiResponse({
    status: 200,
    description: 'Movimientos recientes',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getMovimientosRecientes(@Query('limite', ParseIntPipe) limite?: number) {
    return this.movimientosInventarioService.getMovimientosRecientes(
      limite || 20,
    );
  }

  @Get('resumen-por-tipo')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener resumen de movimientos agrupados por tipo',
  })
  @ApiQuery({
    name: 'fecha_inicio',
    required: false,
    description: 'YYYY-MM-DD',
  })
  @ApiQuery({ name: 'fecha_fin', required: false, description: 'YYYY-MM-DD' })
  @ApiResponse({
    status: 200,
    description: 'Resumen por tipo de movimiento',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getResumenPorTipo(
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
  ) {
    const inicio = fechaInicio ? new Date(fechaInicio) : undefined;
    const fin = fechaFin ? new Date(fechaFin) : undefined;
    return this.movimientosInventarioService.getResumenPorTipo(inicio, fin);
  }

  @Get('producto/:idProducto')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener historial de movimientos de un producto' })
  @ApiParam({ name: 'idProducto', description: 'ID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Historial de movimientos del producto (últimos 50)',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findByProducto(@Param('idProducto', ParseIntPipe) idProducto: number) {
    return this.movimientosInventarioService.findByProducto(idProducto);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener un movimiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del movimiento' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento encontrado con detalles completos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.movimientosInventarioService.findOne(id);
  }
}
