/* eslint-disable @typescript-eslint/no-unsafe-argument */
// ============== orden-detalle.controller.ts ==============
import {
  Controller,
  Get,
  Param,
  Query,
  Patch,
  Body,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { OrdenDetalleService } from './orden-detalle.service';
import { QueryItemsDto } from './dto/query-items.dto';
import { BatchUpdateEstadoDto } from './dto/batch-update-estado.dto';
import { EstadisticasCocinaDto } from './dto/estadisticas-cocina.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Orden-detalle')
@ApiBearerAuth('JWT-auth')
@Controller('orden-detalle')
@UseGuards(JwtAuthGuard)
export class OrdenDetalleController {
  constructor(private readonly ordenDetalleService: OrdenDetalleService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los items con filtros' })
  async findAll(@Query() query: QueryItemsDto) {
    const result = await this.ordenDetalleService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('cocina')
  @ApiOperation({ summary: 'Vista de cocina general' })
  async getCocina(@Query('area') area?: 'cocina' | 'barra') {
    const items = await this.ordenDetalleService.getCocinaView(area);
    return {
      success: true,
      data: items,
    };
  }

  @Get('prioritarios')
  @ApiOperation({ summary: 'Items prioritarios por tiempo de espera' })
  async getPrioritarios() {
    const data = await this.ordenDetalleService.getItemsPrioritarios();
    return {
      success: true,
      data,
    };
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Estadísticas de cocina' })
  async getEstadisticas(@Query() dto: EstadisticasCocinaDto) {
    const stats = await this.ordenDetalleService.getEstadisticasCocina(dto);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('reporte-tiempos')
  @ApiOperation({ summary: 'Reporte de tiempos de preparación' })
  async getReporteTiempos() {
    const reporte = await this.ordenDetalleService.getReporteTiempos();
    return {
      success: true,
      data: reporte,
    };
  }

  @Get('categoria/:categoriaId')
  @ApiOperation({ summary: 'Items pendientes por categoría' })
  async findByCategoria(
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
  ) {
    const items = await this.ordenDetalleService.findByCategoria(categoriaId);
    return {
      success: true,
      data: items,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un item' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const item = await this.ordenDetalleService.findOne(id);
    return {
      success: true,
      data: item,
    };
  }

  @Patch('batch-estado')
  @ApiOperation({ summary: 'Actualizar estado de múltiples items' })
  @ApiResponse({ status: 200, description: 'Items actualizados exitosamente' })
  async batchUpdateEstado(@Body() dto: BatchUpdateEstadoDto, @Request() req) {
    const result = await this.ordenDetalleService.batchUpdateEstado(
      dto,
      req.user.userId,
    );
    return {
      success: true,
      ...result,
    };
  }
}
