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
