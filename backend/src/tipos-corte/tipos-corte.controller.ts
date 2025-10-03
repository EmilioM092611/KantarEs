import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TiposCorteService } from './tipos-corte.service';
import { CreateTipoCorteDto } from './dto/create-tipo-corte.dto';
import { UpdateTipoCorteDto } from './dto/update-tipo-corte.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Tipos de Corte')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tipos-corte')
export class TiposCorteController {
  constructor(private readonly tiposCorteService: TiposCorteService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Crear un nuevo tipo de corte' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de corte creado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 409, description: 'El tipo de corte ya existe' })
  create(@Body() createTipoCorteDto: CreateTipoCorteDto) {
    return this.tiposCorteService.create(createTipoCorteDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener todos los tipos de corte' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de corte obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll() {
    return this.tiposCorteService.findAll();
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({ summary: 'Obtener un tipo de corte por ID' })
  @ApiParam({ name: 'id', description: 'ID del tipo de corte' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de corte encontrado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tipo de corte no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiposCorteService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Actualizar un tipo de corte' })
  @ApiParam({ name: 'id', description: 'ID del tipo de corte' })
  @ApiResponse({
    status: 200,
    description: 'Tipo de corte actualizado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Tipo de corte no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoCorteDto: UpdateTipoCorteDto,
  ) {
    return this.tiposCorteService.update(id, updateTipoCorteDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tipo de corte' })
  @ApiParam({ name: 'id', description: 'ID del tipo de corte' })
  @ApiResponse({
    status: 204,
    description: 'Tipo de corte eliminado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permiso denegado' })
  @ApiResponse({ status: 404, description: 'Tipo de corte no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar porque tiene cortes asociados',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tiposCorteService.remove(id);
  }
}
