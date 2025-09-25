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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UnidadesService } from './unidades.service';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('unidades')
@ApiBearerAuth('JWT-auth')
@Controller('unidades')
@UseGuards(JwtAuthGuard)
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Post()
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
  async findAll() {
    const unidades = await this.unidadesService.findAll();
    return {
      success: true,
      data: unidades,
    };
  }

  @Get('tipo/:tipo')
  async findByTipo(@Param('tipo') tipo: string) {
    const unidades = await this.unidadesService.findByTipo(tipo);
    return {
      success: true,
      data: unidades,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const unidad = await this.unidadesService.findOne(id);
    return {
      success: true,
      data: unidad,
    };
  }

  @Patch(':id')
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
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.unidadesService.remove(id);
    return {
      success: true,
      message: 'Unidad de medida eliminada exitosamente',
    };
  }
}
