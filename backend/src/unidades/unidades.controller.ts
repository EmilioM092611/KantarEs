// ============== UNIDADES.CONTROLLER.TS ==============
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UnidadesService } from './unidades.service';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Unidades de Medida')
@ApiBearerAuth('JWT-auth')
@Controller('unidades')
@UseGuards(JwtAuthGuard)
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nueva unidad de medida',
    description:
      'Crea una unidad de medida para productos e inventario (kg, litros, piezas, etc.)',
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Unidad creada exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una unidad con esa abreviatura',
  })
  async create(@Body() createUnidadDto: CreateUnidadDto) {
    const unidad = await this.unidadesService.create(createUnidadDto);
    return {
      success: true,
      message: 'Unidad de medida creada exitosamente',
      data: unidad,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las unidades de medida',
    description:
      'Obtiene el catálogo completo de unidades de medida disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de unidades obtenida',
  })
  async findAll() {
    const unidades = await this.unidadesService.findAll();
    return {
      success: true,
      data: unidades,
    };
  }

  @Get('tipo/:tipo')
  @ApiOperation({
    summary: 'Obtener unidades por tipo',
    description: 'Filtra unidades por tipo: peso, volumen o unidad',
  })
  @ApiParam({
    name: 'tipo',
    description: 'Tipo de unidad',
    example: 'peso',
    enum: ['peso', 'volumen', 'unidad'],
  })
  @ApiResponse({
    status: 200,
    description: 'Unidades del tipo especificado',
  })
  async findByTipo(@Param('tipo') tipo: string) {
    const unidades = await this.unidadesService.findByTipo(tipo);
    return {
      success: true,
      data: unidades,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener unidad por ID',
    description: 'Obtiene los detalles de una unidad de medida específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la unidad',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Unidad encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Unidad no encontrada',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const unidad = await this.unidadesService.findOne(id);
    return {
      success: true,
      data: unidad,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar unidad de medida',
    description: 'Actualiza los datos de una unidad de medida existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la unidad',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Unidad actualizada',
  })
  @ApiResponse({
    status: 404,
    description: 'Unidad no encontrada',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnidadDto: UpdateUnidadDto,
  ) {
    const unidad = await this.unidadesService.update(id, updateUnidadDto);
    return {
      success: true,
      message: 'Unidad de medida actualizada exitosamente',
      data: unidad,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar unidad de medida',
    description: 'Elimina una unidad de medida si no tiene productos asociados',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la unidad',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Unidad eliminada',
  })
  @ApiResponse({
    status: 404,
    description: 'Unidad no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar, tiene productos asociados',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.unidadesService.remove(id);
    return {
      success: true,
      message: 'Unidad de medida eliminada exitosamente',
    };
  }
}
