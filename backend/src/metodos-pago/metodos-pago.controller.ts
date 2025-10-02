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
import { MetodosPagoService } from './metodos-pago.service';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';
import { FilterMetodoPagoDto } from './dto/filter-metodo-pago.dto';
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

@ApiTags('Métodos de Pago')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('metodos-pago')
export class MetodosPagoController {
  constructor(private readonly metodosPagoService: MetodosPagoService) {}

  @Post()
  @Roles('Administrador', 'Gerente') //Roles de la BD
  @ApiOperation({ summary: 'Crear un nuevo método de pago' })
  @ApiResponse({
    status: 201,
    description: 'Método de pago creado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 409, description: 'El método de pago ya existe' })
  create(@Body() createMetodoPagoDto: CreateMetodoPagoDto) {
    return this.metodosPagoService.create(createMetodoPagoDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({ summary: 'Obtener todos los métodos de pago' })
  @ApiQuery({
    name: 'activo',
    required: false,
    description: 'Filtrar por métodos activos/inactivos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de métodos de pago obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterMetodoPagoDto) {
    return this.metodosPagoService.findAll(filters);
  }

  @Get('activos')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({ summary: 'Obtener solo métodos de pago activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de métodos de pago activos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findActivos() {
    return this.metodosPagoService.findActivos();
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener un método de pago por ID' })
  @ApiParam({ name: 'id', description: 'ID del método de pago' })
  @ApiResponse({
    status: 200,
    description: 'Método de pago encontrado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Método de pago no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.metodosPagoService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Actualizar un método de pago' })
  @ApiParam({ name: 'id', description: 'ID del método de pago' })
  @ApiResponse({
    status: 200,
    description: 'Método de pago actualizado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Método de pago no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMetodoPagoDto: UpdateMetodoPagoDto,
  ) {
    return this.metodosPagoService.update(id, updateMetodoPagoDto);
  }

  @Patch(':id/toggle-activo')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Activar/Desactivar un método de pago' })
  @ApiParam({ name: 'id', description: 'ID del método de pago' })
  @ApiResponse({
    status: 200,
    description: 'Estado del método de pago cambiado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Método de pago no encontrado' })
  toggleActivo(@Param('id', ParseIntPipe) id: number) {
    return this.metodosPagoService.toggleActivo(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un método de pago' })
  @ApiParam({ name: 'id', description: 'ID del método de pago' })
  @ApiResponse({
    status: 204,
    description: 'Método de pago eliminado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Método de pago no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar porque tiene pagos asociados',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.metodosPagoService.remove(id);
  }
}
