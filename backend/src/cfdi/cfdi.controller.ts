import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Header,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import express from 'express';

import { CfdiService } from './cfdi.service';
import { CreateReceptorDto } from './dto/create-receptor.dto';
import { FacturarOrdenDto } from './dto/facturar-orden.dto';
import { CancelarCfdiDto } from './dto/cancelar-cfdi.dto';

@ApiTags('CFDI')
@ApiBearerAuth('JWT-auth')
@Controller('cfdi')
export class CfdiController {
  constructor(private readonly svc: CfdiService) {}

  // ------ Receptores ------
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

  // ------ Timbrado ------
  @Post('facturar/orden/:id')
  @ApiOperation({ summary: 'Generar y timbrar CFDI para una orden' })
  facturarOrden(
    @Param('id', ParseIntPipe) id_orden: number,
    @Body() dto: FacturarOrdenDto,
  ) {
    return this.svc.facturarOrden(id_orden, dto);
  }

  // ------ Cancelación ------
  @Post('cancelar/:id')
  @ApiOperation({ summary: 'Cancelar CFDI por id_cfdi' })
  cancelarPorId(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelarCfdiDto,
  ) {
    return this.svc.cancelarPorId(id, dto);
  }

  @Post('cancelar/uuid/:uuid')
  @ApiOperation({ summary: 'Cancelar CFDI por UUID' })
  cancelarPorUuid(@Param('uuid') uuid: string, @Body() dto: CancelarCfdiDto) {
    return this.svc.cancelarUuid(uuid, dto);
  }

  // ------ Listado y descargas ------
  @Get()
  @ApiOperation({ summary: 'Listar CFDIs con filtros (estado, rfc, uuid)' })
  listar(
    @Query('estado') estado?: 'pendiente' | 'timbrado' | 'cancelado' | 'error',
    @Query('rfc') rfc?: string,
    @Query('uuid') uuid?: string,
  ) {
    const where: any = {};
    if (estado) where.estatus = estado;
    if (uuid) where.uuid = uuid;
    if (rfc) where.cfdi_receptores = { rfc };
    return this.svc.listar(where);
  }

  @Get(':id/xml')
  @ApiOperation({ summary: 'Descargar XML timbrado' })
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async descargarXml(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: express.Response,
  ) {
    const { xml, uuid } = await this.svc.getXml(id);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${uuid || 'cfdi'}.xml"`,
    );
    res.send(xml ?? '');
  }

  @Get(':id/acuse')
  @ApiOperation({ summary: 'Descargar acuse de cancelación (si existe)' })
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async descargarAcuse(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: express.Response,
  ) {
    const { acuse, uuid } = await this.svc.getAcuse(id);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="acuse-${uuid || id}.xml"`,
    );
    res.send(acuse ?? '');
  }
}
