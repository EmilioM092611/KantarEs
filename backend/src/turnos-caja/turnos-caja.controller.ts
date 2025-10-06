/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { TurnosCajaService } from './turnos-caja.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Turnos de Caja')
@ApiBearerAuth('JWT-auth')
@Controller('turnos-caja')
export class TurnosCajaController {
  constructor(private readonly svc: TurnosCajaService) {}

  @Post('abrir')
  @ApiOperation({ summary: 'Abrir un turno/corte de caja' })
  abrir(@Body() dto: any) {
    return this.svc.abrir(dto);
  }

  @Post(':id/cerrar')
  @ApiOperation({ summary: 'Cerrar un turno/corte de caja' })
  cerrar(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.svc.cerrar(id, dto);
  }

  @Get('activos')
  @ApiOperation({ summary: 'Listar turnos/cortes de caja abiertos' })
  activos() {
    return this.svc.activos();
  }
}
