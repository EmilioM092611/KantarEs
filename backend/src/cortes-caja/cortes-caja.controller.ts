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
import { CortesCajaService } from './cortes-caja.service';
import { CreateCorteCajaDto } from './dto/create-corte-caja.dto';
import { CloseCorteCajaDto } from './dto/close-corte-caja.dto';
import { CancelCorteCajaDto } from './dto/cancel-corte-caja.dto';
import { FilterCorteCajaDto } from './dto/filter-corte-caja.dto';
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

@ApiTags('Cortes de Caja')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cortes-caja')
export class CortesCajaController {
  constructor(private readonly cortesCajaService: CortesCajaService) {}

  @Post()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Abrir un nuevo corte de caja' })
  @ApiResponse({
    status: 201,
    description: 'Corte de caja abierto exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un corte abierto',
  })
  create(@Body() createCorteCajaDto: CreateCorteCajaDto) {
    return this.cortesCajaService.create(createCorteCajaDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener todos los cortes de caja con filtros' })
  @ApiQuery({ name: 'id_tipo_corte', required: false })
  @ApiQuery({ name: 'id_usuario_realiza', required: false })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'fecha_desde', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'fecha_hasta', required: false, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'folio_corte', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de cortes de caja obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterCorteCajaDto) {
    return this.cortesCajaService.findAll(filters);
  }

  @Get('abierto')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener el corte de caja actualmente abierto' })
  @ApiResponse({
    status: 200,
    description: 'Corte abierto encontrado o null si no hay ninguno',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findCorteAbierto() {
    return this.cortesCajaService.findCorteAbierto();
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener un corte de caja por ID' })
  @ApiParam({ name: 'id', description: 'ID del corte de caja' })
  @ApiResponse({
    status: 200,
    description: 'Corte de caja encontrado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Corte de caja no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cortesCajaService.findOne(id);
  }

  @Patch(':id/cerrar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Cerrar un corte de caja' })
  @ApiParam({ name: 'id', description: 'ID del corte de caja' })
  @ApiResponse({
    status: 200,
    description: 'Corte de caja cerrado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'El corte no está abierto o datos inválidos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Corte de caja no encontrado' })
  close(
    @Param('id', ParseIntPipe) id: number,
    @Body() closeCorteCajaDto: CloseCorteCajaDto,
  ) {
    return this.cortesCajaService.close(id, closeCorteCajaDto);
  }

  @Patch(':id/cancelar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Cancelar un corte de caja abierto' })
  @ApiParam({ name: 'id', description: 'ID del corte de caja' })
  @ApiResponse({
    status: 200,
    description: 'Corte de caja cancelado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede cancelar un corte cerrado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Corte de caja no encontrado' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelCorteCajaDto: CancelCorteCajaDto,
  ) {
    return this.cortesCajaService.cancel(id, cancelCorteCajaDto);
  }
}
