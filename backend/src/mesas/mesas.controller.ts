// ============== mesas.controller.ts ==============
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { MesasService } from './mesas.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { CambiarEstadoMesaDto } from './dto/cambiar-estado-mesa.dto';
import { QueryMesasDto } from './dto/query-mesas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Mesas')
@ApiBearerAuth('JWT-auth')
@Controller('mesas')
@UseGuards(JwtAuthGuard)
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva mesa' })
  async create(@Body() createMesaDto: CreateMesaDto) {
    const mesa = await this.mesasService.create(createMesaDto);
    return {
      success: true,
      message: 'Mesa creada exitosamente',
      data: mesa,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las mesas' })
  async findAll(@Query() query: QueryMesasDto) {
    const mesas = await this.mesasService.findAll(query);
    return {
      success: true,
      data: mesas,
    };
  }

  @Get('disponibles')
  @ApiOperation({ summary: 'Listar solo mesas disponibles' })
  async findDisponibles() {
    const mesas = await this.mesasService.findDisponibles();
    return {
      success: true,
      data: mesas,
    };
  }

  @Get('mapa')
  @ApiOperation({ summary: 'Obtener mesas para vista de mapa' })
  async getMapa() {
    const mesas = await this.mesasService.getMapa();
    return {
      success: true,
      data: mesas,
    };
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de mesas' })
  async getEstadisticas() {
    const stats = await this.mesasService.getEstadisticas();
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una mesa' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const mesa = await this.mesasService.findOne(id);
    return {
      success: true,
      data: mesa,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar mesa' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMesaDto: UpdateMesaDto,
  ) {
    const mesa = await this.mesasService.update(id, updateMesaDto);
    return {
      success: true,
      message: 'Mesa actualizada exitosamente',
      data: mesa,
    };
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de mesa' })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambiarEstadoDto: CambiarEstadoMesaDto,
  ) {
    const mesa = await this.mesasService.cambiarEstado(id, cambiarEstadoDto);
    return {
      success: true,
      message: 'Estado de mesa actualizado',
      data: mesa,
    };
  }

  @Patch(':id/limpiar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar mesa como limpia' })
  async limpiarMesa(@Param('id', ParseIntPipe) id: number) {
    const mesa = await this.mesasService.limpiarMesa(id);
    return {
      success: true,
      message: 'Mesa marcada como limpia',
      data: mesa,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar mesa (soft delete)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.mesasService.remove(id);
    return {
      success: true,
      message: 'Mesa desactivada exitosamente',
    };
  }
}
