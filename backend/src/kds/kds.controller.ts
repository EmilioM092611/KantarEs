import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { KdsService } from './kds.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Kds')
@ApiBearerAuth('JWT-auth')
@Controller('kds')
export class KdsController {
  constructor(private readonly kds: KdsService) {}

  @Get('tickets')
  @ApiOperation({
    summary: 'Listar tickets de cocina/barra con filtros opcionales',
  })
  listarTickets(@Query() q: any) {
    return this.kds.listarTickets(q);
  }

  @Patch('items/:id/estado')
  @ApiOperation({
    summary:
      'Actualizar el estado de un ítem del ticket (pendiente/en_preparacion/listo)',
  })
  actualizarEstadoItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.kds.actualizarEstadoItem(id, dto);
  }

  @Patch('tickets/:id/listo')
  @ApiOperation({ summary: 'Marcar todos los ítems del ticket como listos' })
  marcarTicketListo(@Param('id', ParseIntPipe) id: number) {
    return this.kds.marcarTicketListo(id);
  }
}
