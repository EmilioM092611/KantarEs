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
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { RecepcionarCompraDto } from './dto/recepcionar-compra.dto';
import { CancelCompraDto } from './dto/cancel-compra.dto';
import { FilterCompraDto } from './dto/filter-compra.dto';
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

@ApiTags('Compras')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Crear una nueva orden de compra' })
  @ApiResponse({
    status: 201,
    description: 'Compra creada exitosamente con su detalle',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o proveedor inactivo',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({
    status: 404,
    description: 'Proveedor o usuario no encontrado',
  })
  create(@Body() createCompraDto: CreateCompraDto) {
    return this.comprasService.create(createCompraDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener todas las compras con filtros opcionales' })
  @ApiQuery({ name: 'id_proveedor', required: false })
  @ApiQuery({ name: 'id_usuario_solicita', required: false })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['pendiente', 'autorizada', 'recibida', 'cancelada'],
  })
  @ApiQuery({ name: 'fecha_desde', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'fecha_hasta', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'folio_compra', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de compras',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterCompraDto) {
    return this.comprasService.findAll(filters);
  }

  @Get('estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener estadísticas de compras' })
  @ApiQuery({
    name: 'id_proveedor',
    required: false,
    description: 'Filtrar por proveedor',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de compras',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getEstadisticas(@Query('id_proveedor', ParseIntPipe) idProveedor?: number) {
    return this.comprasService.getEstadisticas(idProveedor);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener una compra por ID con su detalle completo',
  })
  @ApiParam({ name: 'id', description: 'ID de la compra' })
  @ApiResponse({
    status: 200,
    description: 'Compra encontrada con detalle',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Actualizar una compra pendiente' })
  @ApiParam({ name: 'id', description: 'ID de la compra' })
  @ApiResponse({
    status: 200,
    description: 'Compra actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden editar compras pendientes',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompraDto: UpdateCompraDto,
  ) {
    return this.comprasService.update(id, updateCompraDto);
  }

  @Patch(':id/autorizar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Autorizar una compra pendiente' })
  @ApiParam({ name: 'id', description: 'ID de la compra' })
  @ApiResponse({
    status: 200,
    description: 'Compra autorizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se pueden autorizar compras pendientes',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  autorizar(
    @Param('id', ParseIntPipe) id: number,
    @Body('id_usuario_autoriza', ParseIntPipe) idUsuarioAutoriza: number,
  ) {
    return this.comprasService.autorizar(id, idUsuarioAutoriza);
  }

  @Patch(':id/recepcionar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary:
      'Recepcionar mercancía (marcar como recibida y actualizar cantidades)',
  })
  @ApiParam({ name: 'id', description: 'ID de la compra' })
  @ApiResponse({
    status: 200,
    description: 'Compra recepcionada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'La compra ya fue recibida o está cancelada',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  recepcionar(
    @Param('id', ParseIntPipe) id: number,
    @Body() recepcionarCompraDto: RecepcionarCompraDto,
  ) {
    return this.comprasService.recepcionar(id, recepcionarCompraDto);
  }

  @Patch(':id/cancelar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Cancelar una compra' })
  @ApiParam({ name: 'id', description: 'ID de la compra' })
  @ApiResponse({
    status: 200,
    description: 'Compra cancelada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'La compra ya está cancelada o recibida',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Compra no encontrada' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelCompraDto: CancelCompraDto,
  ) {
    return this.comprasService.cancel(id, cancelCompraDto);
  }
}
