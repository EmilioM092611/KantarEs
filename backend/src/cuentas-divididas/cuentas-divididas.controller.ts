/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CuentasDivididasService } from './cuentas-divididas.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Cuentas Divididas')
@ApiBearerAuth('JWT-auth')
@Controller('cuentas-divididas')
export class CuentasDivididasController {
  constructor(private readonly svc: CuentasDivididasService) {}

  @Post('orden/:id')
  @ApiOperation({
    summary: 'Dividir una orden en grupos (split) y aplicar pagos mixtos',
  })
  splitOrden(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.svc.splitOrden(id, dto);
  }
}
