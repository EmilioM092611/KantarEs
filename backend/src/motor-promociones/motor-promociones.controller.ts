import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { MotorPromocionesService } from './motor-promociones.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Motor de Promociones')
@ApiBearerAuth('JWT-auth')
@Controller('motor-promociones')
export class MotorPromocionesController {
  constructor(private readonly svc: MotorPromocionesService) {}

  @Get('orden/:id/aplicables')
  @ApiOperation({
    summary: 'Listar promociones aplicables a una orden (simulación)',
  })
  aplicables(@Param('id', ParseIntPipe) id: number) {
    return this.svc.promosAplicablesOrden(id);
  }

  @Post('orden/:id/aplicar')
  @ApiOperation({
    summary: 'Aplicar una promoción a la orden',
    description:
      'Aplica por id_promocion o por codigo_promocion. Actualiza la orden con el descuento/total.',
  })
  aplicar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { id_promocion?: number; codigo?: string },
  ) {
    return this.svc.aplicarPromocion(id, dto);
  }
  @Post('orden/:id/aplicar-mejor')
  @ApiOperation({
    summary: 'Aplicar automáticamente la mejor promoción disponible',
  })
  aplicarMejor(@Param('id', ParseIntPipe) id: number) {
    return this.svc.aplicarMejor(id);
  }

  @Post('orden/:id/quitar')
  @ApiOperation({ summary: 'Quitar promoción aplicada y recalcular totales' })
  quitar(@Param('id', ParseIntPipe) id: number) {
    return this.svc.quitarPromocion(id);
  }
}
