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
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UnidadesService } from './unidades.service';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Unidades')
@ApiBearerAuth('JWT-auth')
@Controller('unidades')
@UseGuards(JwtAuthGuard)
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva unidad de medida' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUnidadDto: CreateUnidadDto) {
    const unidad = await this.unidadesService.create(createUnidadDto);
    return {
      success: true,
      message: 'Unidad de medida creada exitosamente',
      data: unidad,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las unidades' })
  async findAll() {
    const unidades = await this.unidadesService.findAll();
    return {
      success: true,
      data: unidades,
    };
  }

  @Get('tipo/:tipo')
  @ApiOperation({ summary: 'Obtener unidad por tipo' })
  async findByTipo(@Param('tipo') tipo: string) {
    const unidades = await this.unidadesService.findByTipo(tipo);
    return {
      success: true,
      data: unidades,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener unidad por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const unidad = await this.unidadesService.findOne(id);
    return {
      success: true,
      data: unidad,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar unidad' })
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
  @ApiOperation({ summary: 'Eliminar unidad' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.unidadesService.remove(id);
    return {
      success: true,
      message: 'Unidad de medida eliminada exitosamente',
    };
  }
}
