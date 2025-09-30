// ============== CORRECCIÓN 1: ordenes/types/orden.types.ts ==============
// Reemplazar el archivo completo con esta versión corregida

import { Decimal } from '@prisma/client/runtime/library';

export interface CalculoTotales {
  subtotal: number;
  descuento_monto: number;
  iva_monto: number;
  ieps_monto: number;
  propina: number;
  total: number;
}

export interface ItemCalculado {
  cantidad: number;
  precio_unitario: number;
  descuento_porcentaje: number;
  descuento_monto: number;
  subtotal: number;
  iva_monto: number;
  ieps_monto: number;
  total: number;
}

export interface EstadisticasOrden {
  total_ordenes: number;
  total_items: number;
  monto_total: number;
  promedio_orden: number;
  ordenes_para_llevar: number;
  ordenes_canceladas: number;
}

// AGREGADO: Exportar la función decimalToNumber
export const decimalToNumber = (value: Decimal | null | undefined): number => {
  if (!value) return 0;
  return typeof value === 'object' ? parseFloat(value.toString()) : value;
};
