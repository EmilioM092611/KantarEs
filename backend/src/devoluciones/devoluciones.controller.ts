/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Post } from '@nestjs/common';
import { DevolucionesService } from './devoluciones.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Devoluciones')
@ApiBearerAuth('JWT-auth')
@Controller('devoluciones')
export class DevolucionesController {
  constructor(private readonly svc: DevolucionesService) {}

  @Post('venta')
  @ApiOperation({
    summary:
      'Registrar devolución de venta (reintegro a inventario y ajuste de la orden)',
  })
  devolucionVenta(@Body() dto: any) {
    return this.svc.devolucionVenta(dto);
  }

  @Post('compra')
  @ApiOperation({
    summary:
      'Registrar devolución de compra a proveedor (salida de inventario)',
  })
  devolucionCompra(@Body() dto: any) {
    return this.svc.devolucionCompra(dto);
  }
}
