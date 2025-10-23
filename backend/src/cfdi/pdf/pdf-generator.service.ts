/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
// backend/src/cfdi/pdf/pdf-generator.service.ts

import { Injectable, Logger } from '@nestjs/common';
// ✅ CORREGIDO: Importación correcta de PDFDocument
import PDFDocument from 'pdfkit';
import { QrGeneratorService } from './qr-generator.service';
import { Readable } from 'stream';

/**
 * Interface para datos del CFDI a incluir en el PDF
 */
export interface CfdiPdfData {
  // Datos del CFDI
  uuid: string;
  serie?: string;
  folio?: string;
  fecha: Date;
  formaPago?: string;
  metodoPago?: string;
  moneda: string;
  tipoCambio?: number;
  tipoComprobante: string;

  // Emisor
  emisor: {
    rfc: string;
    nombre: string;
    regimenFiscal: string;
    codigoPostal: string;
  };

  // Receptor
  receptor: {
    rfc: string;
    nombre: string;
    usoCfdi: string;
    regimenFiscal?: string;
    domicilioFiscal?: string;
  };

  // Conceptos
  conceptos: Array<{
    claveProdServ: string;
    cantidad: number;
    claveUnidad: string;
    unidad?: string;
    descripcion: string;
    valorUnitario: number;
    importe: number;
    descuento?: number;
  }>;

  // Totales
  subtotal: number;
  descuento?: number;
  impuestos: number;
  total: number;

  // Timbrado
  fechaTimbrado: Date;
  noCertificadoSAT: string;
  selloSAT: string;
  selloCFD: string;
  cadenaOriginal: string;
}

/**
 * Servicio para generar PDFs de facturas electrónicas
 */
@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  constructor(private readonly qrService: QrGeneratorService) {}

  /**
   * Generar PDF de factura electrónica
   * @param datos - Datos del CFDI
   * @returns Buffer con el PDF generado
   */
  async generarPdfCfdi(datos: CfdiPdfData): Promise<Buffer> {
    this.logger.debug(`Generando PDF para CFDI: ${datos.uuid}`);

    return new Promise(async (resolve, reject) => {
      try {
        // Crear documento PDF - ✅ CORREGIDO: Usar new PDFDocument correctamente
        const doc = new PDFDocument({
          size: 'LETTER', // Tamaño carta (8.5 x 11 pulgadas)
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
          info: {
            Title: `Factura ${datos.serie || ''}-${datos.folio || ''}`,
            Author: datos.emisor.nombre,
            Subject: 'Comprobante Fiscal Digital por Internet',
            Keywords: 'CFDI, Factura, SAT',
          },
        });

        // Buffer para almacenar el PDF
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Generar código QR
        const qrBuffer = await this.qrService.generarQrCfdi({
          uuid: datos.uuid,
          rfcEmisor: datos.emisor.rfc,
          rfcReceptor: datos.receptor.rfc,
          total: datos.total,
          sello: datos.selloSAT,
        });

        // Construir el PDF
        await this.construirEncabezado(doc, datos);
        await this.construirDatosEmisor(doc, datos.emisor);
        await this.construirDatosReceptor(doc, datos.receptor);
        await this.construirConceptos(doc, datos.conceptos);
        await this.construirTotales(doc, datos);
        await this.construirDatosFiscales(doc, datos, qrBuffer);
        await this.construirPieDePagina(doc, datos);

        // Finalizar documento
        doc.end();

        this.logger.log(`✅ PDF generado exitosamente - UUID: ${datos.uuid}`);
      } catch (error: any) {
        this.logger.error('Error al generar PDF:', error.message);
        reject(error);
      }
    });
  }

  /**
   * Construir encabezado del PDF
   */
  private async construirEncabezado(
    doc: PDFKit.PDFDocument,
    datos: CfdiPdfData,
  ) {
    const pageWidth = doc.page.width;

    // Título principal
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#2C3E50')
      .text('FACTURA ELECTRÓNICA', 50, 50, {
        align: 'center',
        width: pageWidth - 100,
      });

    // Subtítulo
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#7F8C8D')
      .text('Comprobante Fiscal Digital por Internet', {
        align: 'center',
      });

    // Línea separadora
    doc
      .moveTo(50, 90)
      .lineTo(pageWidth - 50, 90)
      .strokeColor('#3498DB')
      .lineWidth(2)
      .stroke();

    // Folio y UUID
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#2C3E50')
      .text(`Folio: ${datos.serie || ''}${datos.folio || 'S/N'}`, 50, 100, {
        align: 'right',
        width: pageWidth - 100,
      });

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#7F8C8D')
      .text(`UUID: ${datos.uuid}`, {
        align: 'right',
      });

    doc.moveDown(2);
  }

  /**
   * Construir sección de datos del emisor
   */
  private async construirDatosEmisor(
    doc: PDFKit.PDFDocument,
    emisor: CfdiPdfData['emisor'],
  ) {
    const startY = doc.y;

    // Título de sección
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .rect(50, startY, 240, 20)
      .fillAndStroke('#3498DB', '#2980B9')
      .fillColor('#FFFFFF')
      .text('EMISOR', 55, startY + 5);

    // Contenido
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#2C3E50')
      .text(emisor.nombre, 55, startY + 30, { width: 230 });

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#7F8C8D')
      .text(`RFC: ${emisor.rfc}`, 55, doc.y + 5)
      .text(`Régimen Fiscal: ${emisor.regimenFiscal}`, 55, doc.y + 3)
      .text(`Código Postal: ${emisor.codigoPostal}`, 55, doc.y + 3);

    doc.moveDown(1);
  }

  /**
   * Construir sección de datos del receptor
   */
  private async construirDatosReceptor(
    doc: PDFKit.PDFDocument,
    receptor: CfdiPdfData['receptor'],
  ) {
    const startY = doc.y;
    const pageWidth = doc.page.width;

    // Título de sección
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .rect(pageWidth - 290, startY - 130, 240, 20)
      .fillAndStroke('#27AE60', '#229954')
      .fillColor('#FFFFFF')
      .text('RECEPTOR', pageWidth - 285, startY - 125);

    // Contenido
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#2C3E50')
      .text(receptor.nombre, pageWidth - 285, startY - 100, { width: 230 });

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#7F8C8D')
      .text(`RFC: ${receptor.rfc}`, pageWidth - 285, startY - 85)
      .text(`Uso CFDI: ${receptor.usoCfdi}`, pageWidth - 285, startY - 72);

    if (receptor.regimenFiscal) {
      doc.text(
        `Régimen: ${receptor.regimenFiscal}`,
        pageWidth - 285,
        startY - 59,
      );
    }
  }

  /**
   * Construir tabla de conceptos
   */
  private async construirConceptos(
    doc: PDFKit.PDFDocument,
    conceptos: CfdiPdfData['conceptos'],
  ) {
    const startY = doc.y + 20;
    const pageWidth = doc.page.width;

    // Encabezado de tabla
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .rect(50, startY, pageWidth - 100, 20)
      .fillAndStroke('#34495E', '#2C3E50');

    const headers = [
      { text: 'Cant.', x: 55, width: 40 },
      { text: 'Unidad', x: 100, width: 50 },
      { text: 'Descripción', x: 155, width: 230 },
      { text: 'P. Unit.', x: 390, width: 70, align: 'right' },
      { text: 'Importe', x: 465, width: 80, align: 'right' },
    ];

    headers.forEach((header) => {
      doc.text(header.text, header.x, startY + 5, {
        width: header.width,
        align: (header.align as any) || 'left',
      });
    });

    // Filas de conceptos
    let currentY = startY + 25;
    const rowHeight = 25;

    conceptos.forEach((concepto, index) => {
      // Fondo alternado
      if (index % 2 === 0) {
        doc
          .rect(50, currentY, pageWidth - 100, rowHeight)
          .fillColor('#ECF0F1')
          .fill();
      }

      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#2C3E50')
        .text(concepto.cantidad.toString(), 55, currentY + 8, {
          width: 40,
          align: 'left',
        })
        .text(concepto.unidad || concepto.claveUnidad, 100, currentY + 8, {
          width: 50,
        })
        .text(concepto.descripcion, 155, currentY + 8, {
          width: 230,
        })
        .text(`$${concepto.valorUnitario.toFixed(2)}`, 390, currentY + 8, {
          width: 70,
          align: 'right',
        })
        .text(`$${concepto.importe.toFixed(2)}`, 465, currentY + 8, {
          width: 80,
          align: 'right',
        });

      currentY += rowHeight;
    });

    doc.y = currentY + 10;
  }

  /**
   * Construir sección de totales
   */
  private async construirTotales(doc: PDFKit.PDFDocument, datos: CfdiPdfData) {
    const pageWidth = doc.page.width;
    const startX = pageWidth - 250;
    const startY = doc.y;

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#2C3E50')
      .text('Subtotal:', startX, startY)
      .text(`$${datos.subtotal.toFixed(2)}`, startX + 100, startY, {
        width: 100,
        align: 'right',
      });

    if (datos.descuento && datos.descuento > 0) {
      doc
        .text('Descuento:', startX, doc.y + 5)
        .text(`-$${datos.descuento.toFixed(2)}`, startX + 100, doc.y, {
          width: 100,
          align: 'right',
        });
    }

    doc
      .text('Impuestos:', startX, doc.y + 5)
      .text(`$${datos.impuestos.toFixed(2)}`, startX + 100, doc.y, {
        width: 100,
        align: 'right',
      });

    // Total con fondo
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .rect(startX - 10, doc.y + 10, 210, 30)
      .fillAndStroke('#3498DB', '#2980B9')
      .fillColor('#FFFFFF')
      .text('TOTAL:', startX, doc.y + 20)
      .text(`$${datos.total.toFixed(2)}`, startX + 100, doc.y, {
        width: 100,
        align: 'right',
      });

    doc.moveDown(3);
  }

  /**
   * Construir sección de datos fiscales con QR
   */
  private async construirDatosFiscales(
    doc: PDFKit.PDFDocument,
    datos: CfdiPdfData,
    qrBuffer: Buffer,
  ) {
    const startY = doc.y;
    const pageWidth = doc.page.width;

    // Código QR (izquierda)
    doc.image(qrBuffer, 60, startY, {
      width: 120,
      height: 120,
    });

    // Datos del timbrado (derecha del QR)
    const textX = 200;
    doc
      .fontSize(7)
      .font('Helvetica-Bold')
      .fillColor('#2C3E50')
      .text('DATOS DE TIMBRADO', textX, startY);

    doc
      .fontSize(6)
      .font('Helvetica')
      .fillColor('#7F8C8D')
      .text(
        `Fecha de Timbrado: ${datos.fechaTimbrado.toLocaleString('es-MX')}`,
        textX,
        doc.y + 5,
      )
      .text(`No. Certificado SAT: ${datos.noCertificadoSAT}`, textX, doc.y + 3);

    // Sellos (en dos columnas por espacio)
    doc
      .fontSize(6)
      .font('Helvetica-Bold')
      .text('Sello Digital del CFDI:', 60, startY + 135);

    doc
      .fontSize(5)
      .font('Helvetica')
      .text(this.cortarTexto(datos.selloCFD, 100), 60, doc.y + 2, {
        width: pageWidth - 110,
      });

    doc
      .fontSize(6)
      .font('Helvetica-Bold')
      .text('Sello Digital del SAT:', 60, doc.y + 8);

    doc
      .fontSize(5)
      .font('Helvetica')
      .text(this.cortarTexto(datos.selloSAT, 100), 60, doc.y + 2, {
        width: pageWidth - 110,
      });

    doc
      .fontSize(6)
      .font('Helvetica-Bold')
      .text('Cadena Original del Complemento:', 60, doc.y + 8);

    doc
      .fontSize(5)
      .font('Helvetica')
      .text(this.cortarTexto(datos.cadenaOriginal, 150), 60, doc.y + 2, {
        width: pageWidth - 110,
      });
  }

  /**
   * Construir pie de página
   */
  private async construirPieDePagina(
    doc: PDFKit.PDFDocument,
    datos: CfdiPdfData,
  ) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#95A5A6')
      .text(
        'Este documento es una representación impresa de un CFDI',
        50,
        pageHeight - 60,
        {
          align: 'center',
          width: pageWidth - 100,
        },
      )
      .text(`Generado el ${new Date().toLocaleString('es-MX')}`, {
        align: 'center',
      });
  }

  /**
   * Utilidad para cortar texto largo
   */
  private cortarTexto(texto: string, maxLength: number): string {
    if (texto.length <= maxLength) {
      return texto;
    }
    return texto.substring(0, maxLength) + '...';
  }
}
