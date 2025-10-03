import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { AdjustInventarioDto } from './dto/adjust-inventario.dto';
import { FilterInventarioDto } from './dto/filter-inventario.dto';
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

@ApiTags('Inventario')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Crear registro de inventario para un producto' })
  @ApiResponse({
    status: 201,
    description: 'Inventario creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Producto no inventariable' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe inventario para este producto',
  })
  create(@Body() createInventarioDto: CreateInventarioDto) {
    return this.inventarioService.create(createInventarioDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener todos los inventarios con filtros opcionales',
  })
  @ApiQuery({ name: 'id_producto', required: false })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['critico', 'bajo', 'normal', 'exceso'],
  })
  @ApiQuery({ name: 'requiere_refrigeracion', required: false })
  @ApiQuery({ name: 'ubicacion_almacen', required: false })
  @ApiQuery({ name: 'solo_bajo_stock', required: false })
  @ApiQuery({ name: 'punto_reorden_alcanzado', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de inventarios con estado calculado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterInventarioDto) {
    return this.inventarioService.findAll(filters);
  }

  @Get('alertas/bajo-stock')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener productos con stock bajo el mínimo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos críticos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProductosBajoStock() {
    return this.inventarioService.getProductosBajoStock();
  }

  @Get('alertas/reorden')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener productos que alcanzaron el punto de reorden',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos en punto de reorden con cantidad sugerida',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProductosReorden() {
    return this.inventarioService.getProductosReorden();
  }

  @Get('estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener estadísticas generales del inventario' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del inventario',
    schema: {
      type: 'object',
      properties: {
        total_productos: { type: 'number' },
        productos_criticos: { type: 'number' },
        productos_punto_reorden: { type: 'number' },
        productos_normal: { type: 'number' },
        valor_total_inventario: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getEstadisticas() {
    return this.inventarioService.getEstadisticas();
  }

  @Get('producto/:idProducto')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({ summary: 'Obtener inventario de un producto específico' })
  @ApiParam({ name: 'idProducto', description: 'ID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Inventario del producto',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'No existe inventario para este producto',
  })
  findByProducto(@Param('idProducto', ParseIntPipe) idProducto: number) {
    return this.inventarioService.findByProducto(idProducto);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener un inventario por ID' })
  @ApiParam({ name: 'id', description: 'ID del inventario' })
  @ApiResponse({
    status: 200,
    description: 'Inventario encontrado con estado calculado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Inventario no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Actualizar configuración de inventario' })
  @ApiParam({ name: 'id', description: 'ID del inventario' })
  @ApiResponse({
    status: 200,
    description: 'Inventario actualizado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Inventario no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventarioDto: UpdateInventarioDto,
  ) {
    return this.inventarioService.update(id, updateInventarioDto);
  }

  @Patch(':id/ajustar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Ajustar stock manualmente (para inventario físico)',
  })
  @ApiParam({ name: 'id', description: 'ID del inventario' })
  @ApiResponse({
    status: 200,
    description: 'Stock ajustado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Inventario no encontrado' })
  adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() adjustInventarioDto: AdjustInventarioDto,
  ) {
    return this.inventarioService.adjustStock(id, adjustInventarioDto);
  }
}
