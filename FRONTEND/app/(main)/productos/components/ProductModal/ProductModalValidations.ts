import type { Producto } from "@/lib/api/productos";

export interface StepValidation {
  isValid: boolean;
  message?: string;
}

/**
 * Valida el paso 1: Información Básica
 */
export function validateStep1(producto: Partial<Producto>): StepValidation {
  if (!producto.nombre?.trim()) {
    return { isValid: false, message: "El nombre del producto es requerido" };
  }
  if (!producto.categoria_id) {
    return { isValid: false, message: "La categoría es requerida" };
  }
  if (!producto.unidad_medida_id) {
    return { isValid: false, message: "La unidad de medida es requerida" };
  }
  return { isValid: true };
}

/**
 * Valida el paso 2: Precios y Costos
 */
export function validateStep2(producto: Partial<Producto>): StepValidation {
  if (
    producto.precio === undefined ||
    producto.precio === null ||
    producto.precio < 0
  ) {
    return { isValid: false, message: "El precio de venta es requerido" };
  }
  if (
    producto.costo === undefined ||
    producto.costo === null ||
    producto.costo < 0
  ) {
    return { isValid: false, message: "El costo es requerido" };
  }
  if (producto.precio < producto.costo) {
    return { isValid: false, message: "El precio debe ser mayor al costo" };
  }
  return { isValid: true };
}

/**
 * Valida el paso 3: Inventario y Preparación
 */
export function validateStep3(producto: Partial<Producto>): StepValidation {
  if (
    producto.stock === undefined ||
    producto.stock === null ||
    producto.stock < 0
  ) {
    return { isValid: false, message: "El stock inicial es requerido" };
  }
  if (
    producto.tiempo_prep === undefined ||
    producto.tiempo_prep === null ||
    producto.tiempo_prep < 0
  ) {
    return { isValid: false, message: "El tiempo de preparación es requerido" };
  }
  return { isValid: true };
}
