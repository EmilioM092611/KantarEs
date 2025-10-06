import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CfdiService } from './cfdi.service';
import { CreateReceptorDto } from './dto/create-receptor.dto';
import { FacturarOrdenDto } from './dto/facturar-orden.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('CFDI')
@ApiBearerAuth('JWT-auth')
@Controller('cfdi')
export class CfdiController {
  constructor(private readonly svc: CfdiService) {}

  @Post('receptores')
  @ApiOperation({ summary: 'Crear receptor (datos fiscales del cliente)' })
  crearReceptor(@Body() dto: CreateReceptorDto) {
    return this.svc.crearReceptor(dto);
  }

  @Get('receptores')
  @ApiOperation({ summary: 'Buscar receptores por RFC/razón social' })
  buscarReceptores(@Query('q') q?: string) {
    return this.svc.buscarReceptores(q);
  }

  @Post('facturar/orden/:id')
  @ApiOperation({
    summary:
      'Generar y timbrar CFDI para una orden (usa PAC "mock" si no hay proveedor)',
  })
  facturarOrden(
    @Param('id', ParseIntPipe) id_orden: number,
    @Body() dto: FacturarOrdenDto,
  ) {
    return this.svc.facturarOrden(id_orden, dto);
  }
}
