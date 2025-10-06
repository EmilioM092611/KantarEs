/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CuentasCobrarService } from './cuentas-cobrar.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Cuentas por Cobrar')
@ApiBearerAuth('JWT-auth')
@Controller('ar')
export class CuentasCobrarController {
  constructor(private readonly svc: CuentasCobrarService) {}

  @Post('cuentas')
  @ApiOperation({ summary: 'Crear cuenta por cobrar para un cliente/persona' })
  crearCuenta(@Body() dto: any) {
    return this.svc.crearCuenta(dto);
  }

  @Get('cuentas')
  @ApiOperation({
    summary: 'Listar cuentas por cobrar (filtros por estado/persona)',
  })
  listar(@Query() q: any) {
    return this.svc.listar(q);
  }

  @Get('cuentas/:id')
  @ApiOperation({ summary: 'Detalle de una cuenta por cobrar' })
  detalle(@Param('id', ParseIntPipe) id: number) {
    return this.svc.detalle(id);
  }

  @Post('cuentas/:id/cargo')
  @ApiOperation({ summary: 'Registrar cargo (aumenta saldo)' })
  cargo(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.svc.cargo(id, dto);
  }

  @Post('cuentas/:id/abono')
  @ApiOperation({ summary: 'Registrar abono (disminuye saldo)' })
  abono(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.svc.abono(id, dto);
  }
}
