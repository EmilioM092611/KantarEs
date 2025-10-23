/* eslint-disable @typescript-eslint/no-unused-vars */
// src/cfdi/relaciones/relaciones.service.ts

import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearNotaCreditoDto } from '../dto/crear-nota-credito.dto';
import { CrearComplementoPagoDto } from '../dto/crear-complemento-pago.dto';
import { buildCfdi40Xml } from '../xml/cfdi40-builder';

@Injectable()
export class RelacionesService {
  private readonly logger = new Logger(RelacionesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crear nota de crédito (CFDI tipo Egreso)
   */
  async crearNotaCredito(dto: CrearNotaCreditoDto) {
    this.logger.log(
      `Creando nota de crédito para UUID: ${dto.uuid_relacionado}`,
    );

    // Validar que el CFDI relacionado exista y esté timbrado
    const cfdiOriginal = await this.prisma.cfdi_comprobantes.findFirst({
      where: {
        uuid: dto.uuid_relacionado,
        estatus: 'timbrado',
      },
      include: {
        cfdi_receptores: true,
      },
    });

    if (!cfdiOriginal) {
      throw new NotFoundException(
        'El CFDI relacionado no existe o no está timbrado',
      );
    }

    // Validar que el receptor sea el mismo
    if (cfdiOriginal.id_receptor !== dto.id_receptor) {
      throw new BadRequestException(
        'El receptor de la nota de crédito debe ser el mismo que el CFDI original',
      );
    }

    // Validar que el total de la nota no exceda el total de la factura original
    if (dto.total > Number(cfdiOriginal.total)) {
      throw new BadRequestException(
        'El total de la nota de crédito no puede exceder el total de la factura original',
      );
    }

    // Obtener datos del receptor
    const receptor = await this.prisma.cfdi_receptores.findUnique({
      where: { id_receptor: dto.id_receptor },
    });

    if (!receptor) {
      throw new NotFoundException('Receptor no encontrado');
    }

    // Construir XML de la nota de crédito
    const xmlNotaCredito = this.buildXmlNotaCredito(
      dto,
      receptor,
      cfdiOriginal,
    );

    // Crear registro en BD
    const notaCredito = await this.prisma.cfdi_comprobantes.create({
      data: {
        id_receptor: dto.id_receptor,
        tipo: 'E', // Egreso
        serie: dto.serie ?? 'NC',
        folio: dto.folio ?? null,
        subtotal: dto.subtotal as any,
        total: dto.total as any,
        estatus: 'pendiente',
        xml: xmlNotaCredito,
        // Guardar relación
        uuid_relacionado: dto.uuid_relacionado as any,
        tipo_relacion: dto.tipo_relacion as any,
        motivo_cancelacion: dto.motivo as any, // Usamos este campo para el motivo de la nota
      },
    });

    this.logger.log(`Nota de crédito creada con ID: ${notaCredito.id_cfdi}`);

    return {
      ok: true,
      id_cfdi: notaCredito.id_cfdi,
      tipo: 'E',
      mensaje: 'Nota de crédito creada. Pendiente de timbrado.',
      xml_preview: xmlNotaCredito.substring(0, 200) + '...',
    };
  }

  /**
   * Crear complemento de pago (CFDI tipo Pago)
   */
  async crearComplementoPago(dto: CrearComplementoPagoDto) {
    this.logger.log('Creando complemento de pago');

    // Validar que todos los documentos relacionados existan
    for (const doc of dto.pago.documentos_relacionados) {
      const cfdi = await this.prisma.cfdi_comprobantes.findFirst({
        where: {
          uuid: doc.id_documento,
          estatus: 'timbrado',
        },
      });

      if (!cfdi) {
        throw new NotFoundException(
          `El CFDI ${doc.id_documento} no existe o no está timbrado`,
        );
      }

      // Validar que el receptor sea el mismo
      if (cfdi.id_receptor !== dto.id_receptor) {
        throw new BadRequestException(
          `El receptor del CFDI ${doc.id_documento} no coincide`,
        );
      }
    }

    // Obtener datos del receptor
    const receptor = await this.prisma.cfdi_receptores.findUnique({
      where: { id_receptor: dto.id_receptor },
    });

    if (!receptor) {
      throw new NotFoundException('Receptor no encontrado');
    }

    // Construir XML del complemento de pago
    const xmlComplemento = this.buildXmlComplementoPago(dto, receptor);

    // Crear registro en BD
    const complemento = await this.prisma.cfdi_comprobantes.create({
      data: {
        id_receptor: dto.id_receptor,
        tipo: 'P', // Pago
        serie: dto.serie ?? 'P',
        folio: dto.folio ?? null,
        subtotal: 0 as any, // Los complementos de pago siempre van en 0
        total: 0 as any,
        estatus: 'pendiente',
        xml: xmlComplemento,
      },
    });

    this.logger.log(
      `Complemento de pago creado con ID: ${complemento.id_cfdi}`,
    );

    return {
      ok: true,
      id_cfdi: complemento.id_cfdi,
      tipo: 'P',
      mensaje: 'Complemento de pago creado. Pendiente de timbrado.',
      xml_preview: xmlComplemento.substring(0, 200) + '...',
    };
  }

  /**
   * Obtener CFDIs relacionados a un UUID
   */
  async obtenerRelacionados(uuid: string) {
    // Buscar CFDIs que tengan este UUID como relacionado
    const relacionados = await this.prisma.cfdi_comprobantes.findMany({
      where: {
        uuid_relacionado: uuid as any,
      },
      include: {
        cfdi_receptores: {
          select: {
            rfc: true,
            razon_social: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Buscar el CFDI original
    const cfdiOriginal = await this.prisma.cfdi_comprobantes.findFirst({
      where: { uuid },
      include: {
        cfdi_receptores: {
          select: {
            rfc: true,
            razon_social: true,
          },
        },
      },
    });

    return {
      cfdi_original: cfdiOriginal,
      cfdis_relacionados: relacionados.map((cfdi) => ({
        id_cfdi: cfdi.id_cfdi,
        uuid: cfdi.uuid,
        tipo: cfdi.tipo,
        tipo_relacion: (cfdi as any).tipo_relacion,
        fecha_timbrado: cfdi.fecha_timbrado,
        total: Number(cfdi.total),
        estatus: cfdi.estatus,
        receptor: cfdi.cfdi_receptores,
      })),
      total_relacionados: relacionados.length,
    };
  }

  /**
   * Construir XML de nota de crédito
   */
  private buildXmlNotaCredito(
    dto: CrearNotaCreditoDto,
    receptor: any,
    cfdiOriginal: any,
  ): string {
    const emisorConfig = {
      rfc: process.env.CFDI_EMISOR_RFC!,
      nombre: process.env.CFDI_EMISOR_NOMBRE!,
      regimen: process.env.CFDI_EMISOR_REGIMEN!,
      lugarExpedicion: process.env.CFDI_LUGAR_EXPEDICION!,
    };

    // Base del XML
    let xml = buildCfdi40Xml({
      serie: dto.serie ?? 'NC',
      folio: dto.folio ?? undefined,
      tipo: 'E', // Egreso
      emisor: emisorConfig,
      receptor: {
        rfc: receptor.rfc,
        nombre: receptor.razon_social,
        usoCfdi: receptor.uso_cfdi,
      },
      conceptos: dto.conceptos.map((c) => ({
        descripcion: c.descripcion,
        cantidad: c.cantidad,
        precioUnitario: c.precio_unitario,
        importe: c.importe,
        claveProdServ: c.clave_prod_serv ?? '01010101',
        claveUnidad: c.clave_unidad ?? 'H87',
      })),
      subtotal: dto.subtotal,
      total: dto.total,
    });

    // Agregar nodo de relación antes del cierre del Comprobante
    const relacionXml = `
  <cfdi:CfdiRelacionados TipoRelacion="${dto.tipo_relacion}">
    <cfdi:CfdiRelacionado UUID="${dto.uuid_relacionado}" />
  </cfdi:CfdiRelacionados>`;

    // Insertar después del nodo Emisor
    xml = xml.replace('</cfdi:Emisor>', `</cfdi:Emisor>${relacionXml}`);

    return xml;
  }

  /**
   * Construir XML de complemento de pago
   */
  private buildXmlComplementoPago(
    dto: CrearComplementoPagoDto,
    receptor: any,
  ): string {
    const emisorConfig = {
      rfc: process.env.CFDI_EMISOR_RFC!,
      nombre: process.env.CFDI_EMISOR_NOMBRE!,
      regimen: process.env.CFDI_EMISOR_REGIMEN!,
      lugarExpedicion: process.env.CFDI_LUGAR_EXPEDICION!,
    };

    // Para complementos de pago, el XML es diferente
    // Aquí una versión simplificada
    const xmlns = 'http://www.sat.gob.mx/cfd/4';
    const xmlnsPago = 'http://www.sat.gob.mx/Pagos20';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="${xmlns}" xmlns:pago20="${xmlnsPago}" 
  Version="4.0" Serie="${dto.serie ?? 'P'}" Folio="${dto.folio ?? ''}"
  Fecha="${new Date().toISOString()}"
  SubTotal="0" Total="0" Moneda="XXX" TipoDeComprobante="P"
  LugarExpedicion="${emisorConfig.lugarExpedicion}">
  <cfdi:Emisor Rfc="${emisorConfig.rfc}" Nombre="${emisorConfig.nombre}" RegimenFiscal="${emisorConfig.regimen}" />
  <cfdi:Receptor Rfc="${receptor.rfc}" Nombre="${receptor.razon_social}" UsoCFDI="CP01" />
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="84111506" Cantidad="1" ClaveUnidad="ACT"
      Descripcion="Pago" ValorUnitario="0" Importe="0" />
  </cfdi:Conceptos>
  <cfdi:Complemento>
    <pago20:Pagos Version="2.0">
      <pago20:Totales MontoTotalPagos="${dto.pago.monto}" />
      <pago20:Pago FechaPago="${dto.pago.fecha_pago}" FormaDePagoP="${dto.pago.forma_pago_p}"
        MonedaP="${dto.pago.moneda_p}" Monto="${dto.pago.monto}"`;

    if (dto.pago.num_operacion) {
      xml += ` NumOperacion="${dto.pago.num_operacion}"`;
    }

    xml += `>`;

    // Documentos relacionados
    dto.pago.documentos_relacionados.forEach((doc) => {
      xml += `
        <pago20:DoctoRelacionado IdDocumento="${doc.id_documento}" Serie="${doc.serie}" Folio="${doc.folio}"
          MonedaDR="${doc.moneda_dr}" NumParcialidad="${doc.num_parcialidad}"
          ImpSaldoAnt="${doc.imp_saldo_ant}" ImpPagado="${doc.imp_pagado}"
          ImpSaldoInsoluto="${doc.imp_saldo_insoluto}" />`;
    });

    xml += `
      </pago20:Pago>
    </pago20:Pagos>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

    return xml;
  }
}
