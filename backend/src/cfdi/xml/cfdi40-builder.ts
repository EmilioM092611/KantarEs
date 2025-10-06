// src/cfdi/xml/cfdi40-builder.ts

export interface CfdiBuildOptions {
  serie?: string | null;
  folio?: string | null;
  tipo?: 'I' | 'P' | 'E';
  emisor: {
    rfc: string;
    nombre: string;
    regimen: string; // catálogo SAT (p.ej. 601)
    lugarExpedicion: string; // CP
  };
  receptor: {
    rfc: string;
    nombre: string;
    usoCfdi: string; // catálogo SAT (p.ej. G03)
    regimen?: string;
    domicilioFiscal?: string;
  };
  conceptos: Array<{
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    importe: number;
    claveProdServ?: string; // p.ej. '01010101'
    claveUnidad?: string; // p.ej. 'H87'
    unidad?: string; // opcional
    unit?: string; // alias opcional (por si lo usas en otro lado)
  }>;
  subtotal: number;
  total: number;
}

export function buildCfdi40Xml(opts: CfdiBuildOptions): string {
  const xmlns = 'http://www.sat.gob.mx/cfd/4';
  const xmlnsTfd = 'http://www.sat.gob.mx/TimbreFiscalDigital';
  const xsi = 'http://www.w3.org/2001/XMLSchema-instance';
  const schemaLocation =
    'http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd';

  const serie = opts.serie ?? '';
  const folio = opts.folio ?? '';
  const tipoComprobante = opts.tipo ?? 'I';

  const conceptosXml = opts.conceptos
    .map((c) => {
      const cps = c.claveProdServ ?? '01010101';
      const cu = c.claveUnidad ?? 'H87';
      const uni = c.unit ?? c.unidad; // cualquiera de las dos si viene
      return [
        `<cfdi:Concepto ClaveProdServ="${cps}" Cantidad="${c.cantidad.toFixed(2)}" ClaveUnidad="${cu}"`,
        ` Descripcion="${escapeXml(c.descripcion)}" ValorUnitario="${c.precioUnitario.toFixed(2)}" Importe="${c.importe.toFixed(2)}"`,
        uni ? ` Unidad="${escapeXml(uni)}"` : '',
        ` />`,
      ].join('');
    })
    .join('');

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<cfdi:Comprobante xmlns:cfdi="${xmlns}" xmlns:tfd="${xmlnsTfd}" xmlns:xsi="${xsi}"`,
    ` xsi:schemaLocation="${schemaLocation}"`,
    ` Version="4.0" Serie="${serie}" Folio="${folio}"`,
    ` Fecha="${new Date().toISOString()}"`,
    ` SubTotal="${opts.subtotal.toFixed(2)}" Total="${opts.total.toFixed(2)}"`,
    ` Moneda="MXN" TipoDeComprobante="${tipoComprobante}"`,
    ` LugarExpedicion="${opts.emisor.lugarExpedicion}">`,
    `  <cfdi:Emisor Rfc="${opts.emisor.rfc}" Nombre="${escapeXml(opts.emisor.nombre)}" RegimenFiscal="${opts.emisor.regimen}" />`,
    `  <cfdi:Receptor Rfc="${opts.receptor.rfc}" Nombre="${escapeXml(opts.receptor.nombre)}" UsoCFDI="${opts.receptor.usoCfdi}"`,
    opts.receptor.regimen
      ? ` RegimenFiscalReceptor="${opts.receptor.regimen}"`
      : '',
    opts.receptor.domicilioFiscal
      ? ` DomicilioFiscalReceptor="${opts.receptor.domicilioFiscal}"`
      : '',
    ` />`,
    `  <cfdi:Conceptos>`,
    conceptosXml,
    `  </cfdi:Conceptos>`,
    `</cfdi:Comprobante>`,
  ].join('');
}

function escapeXml(s: string) {
  return String(s).replace(
    /[<>&"']/g,
    (ch) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[ch]!,
  );
}
