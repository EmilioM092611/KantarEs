import { Controller, Get, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Reportes')
@ApiBearerAuth('JWT-auth')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly svc: ReportesService) {}

  @Get('ventas')
  @ApiOperation({ summary: 'Obtener métricas de ventas en un rango de fechas' })
  ventas(@Query() q: any) {
    return this.svc.ventas(q);
  }

  @Get('inventario/bajo-stock')
  @ApiOperation({ summary: 'Listar productos con stock bajo o crítico' })
  bajoStock() {
    return this.svc.bajoStock();
  }

  @Get('kpis')
  @ApiOperation({
    summary: 'KPIs generales del sistema (ventas, productos, mesas)',
  })
  kpis(@Query() q: any) {
    return this.svc.kpis(q);
  }
}
/*
import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Reportes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('ventas-dia')
  @Roles('Administrador', 'Gerente')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Obtener reporte de ventas del día' })
  @ApiQuery({ name: 'fecha', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'Reporte generado exitosamente' })
  async getVentasDia(@Query('fecha') fecha?: string) {
    const fechaConsulta = fecha ? new Date(fecha) : new Date();
    return this.reportesService.getVentasDia(fechaConsulta);
  }

  @Get('productos-top')
  @Roles('Administrador', 'Gerente')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Obtener productos más vendidos' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'fechaInicio', required: false, type: Date })
  @ApiQuery({ name: 'fechaFin', required: false, type: Date })
  async getProductosTop(
    @Query('limit') limit?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.reportesService.getProductosTop(
      limit ? parseInt(limit, 10) : 10,
      fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin ? new Date(fechaFin) : undefined,
    );
  }

  @Get('estado-mesas')
  @Roles('Administrador', 'Gerente', 'Mesero')
  @ApiOperation({ summary: 'Obtener estado actual de todas las mesas' })
  async getEstadoMesas() {
    return this.reportesService.getEstadoMesas();
  }

  @Get('inventario-critico')
  @Roles('Administrador', 'Gerente', 'Chef')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Obtener productos con inventario crítico' })
  async getInventarioCritico() {
    return this.reportesService.getInventarioCritico();
  }

  @Get('sugerencia-compras')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener sugerencias de compras basadas en consumo' })
  @ApiQuery({ name: 'diasAnalisis', required: false, type: Number })
  async getSugerenciaCompras(@Query('diasAnalisis') diasAnalisis?: string) {
    return this.reportesService.getSugerenciaCompras(
      diasAnalisis ? parseInt(diasAnalisis, 10) : 30,
    );
  }

  @Post('refresh-mv')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Refrescar vistas materializadas' })
  @ApiResponse({ 
    status: 200, 
    description: 'Actualización iniciada',
    schema: {
      properties: {
        jobId: { type: 'string' },
        status: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async refreshMaterializedViews() {
    return this.reportesService.refreshMaterializedViews();
  }
} 
*/
