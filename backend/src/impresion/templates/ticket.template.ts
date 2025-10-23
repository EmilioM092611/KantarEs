// backend/src/impresion/templates/ticket.template.ts

import { DatosTicket } from '../interfaces/impresion.interface';

export class TicketTemplate {
  static generar(datos: DatosTicket): string {
    const {
      numero_orden,
      fecha_hora,
      mesa,
      mesero,
      items,
      subtotal,
      descuento,
      impuestos,
      propina,
      total,
      metodo_pago,
      notas,
    } = datos;

    const fecha = new Date(fecha_hora).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let contenido = `
========================================
           KANTARES RESTAURANTE
========================================
RFC: XXX000000XXX
Av. Revolución 123, CDMX
Tel: +52 55 1234 5678
========================================

Ticket: ${numero_orden}
${mesa ? `Mesa: ${mesa}` : 'Para llevar'}
Atendió: ${mesero}
Fecha: ${fecha}

========================================
CANT  DESCRIPCION      P.U.    IMPORTE
========================================
`;

    // Items
    items.forEach((item) => {
      const nombre = item.nombre.substring(0, 16).padEnd(16);
      const precio = `$${item.precio_unitario.toFixed(2)}`.padStart(7);
      const importe = `$${item.subtotal.toFixed(2)}`.padStart(8);
      contenido += `${item.cantidad.toString().padStart(4)}  ${nombre} ${precio} ${importe}\n`;
    });

    contenido += '========================================\n';

    // Totales
    contenido += `Subtotal:             $${subtotal.toFixed(2).padStart(10)}\n`;
    if (descuento > 0) {
      contenido += `Descuento:            $${descuento.toFixed(2).padStart(10)}\n`;
    }
    contenido += `IVA (16%):            $${impuestos.toFixed(2).padStart(10)}\n`;
    if (propina > 0) {
      contenido += `Propina:              $${propina.toFixed(2).padStart(10)}\n`;
    }
    contenido += '========================================\n';
    contenido += `TOTAL:                $${total.toFixed(2).padStart(10)}\n`;
    contenido += '========================================\n';
    contenido += `Método de pago: ${metodo_pago}\n`;
    contenido += '========================================\n';

    if (notas) {
      contenido += `\n${notas}\n\n`;
    }

    contenido += `
     ¡GRACIAS POR SU VISITA!
      www.kantares.com

`;

    contenido += '\n\n\n';

    return contenido;
  }
}
