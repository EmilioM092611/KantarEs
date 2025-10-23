// backend/src/impresion/templates/comanda.template.ts

import { DatosComanda } from '../interfaces/impresion.interface';

export class ComandaTemplate {
  static generar(datos: DatosComanda): string {
    const { numero_orden, mesa, mesero, fecha_hora, items, notas } = datos;

    const fecha = new Date(fecha_hora).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let contenido = `
========================================
           COMANDA DE COCINA
========================================
Orden: ${numero_orden}
Mesa: ${mesa}
Mesero: ${mesero}
Fecha: ${fecha}
========================================

`;

    // Items
    items.forEach((item) => {
      contenido += `${item.cantidad}x  ${item.nombre}\n`;
      if (item.notas) {
        contenido += `     ** ${item.notas} **\n`;
      }
      contenido += '\n';
    });

    contenido += '========================================\n';

    // Notas generales
    if (notas) {
      contenido += `\nNOTAS: ${notas}\n`;
      contenido += '========================================\n';
    }

    contenido += '\n\n\n';

    return contenido;
  }
}
