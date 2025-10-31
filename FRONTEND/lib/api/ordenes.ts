// FRONTEND/lib/api/ordenes.ts
// Servicio para gestión de órdenes

import { apiClient } from "./client";

// Tipos de datos
export interface Orden {
  id_orden: number;
  folio: string;
  id_mesa?: number;
  id_estado_orden: number;
  subtotal: number;
  iva_monto: number;
  total: number;
  fecha_hora_creacion: string;
  notas?: string;
  orden_detalle?: OrdenDetalle[];
  mesas?: {
    numero_mesa: string;
  };
  estados_orden?: {
    nombre: string;
    color_hex: string;
  };
}

export interface OrdenDetalle {
  id_detalle: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string;
  productos?: {
    nombre: string;
    sku: string;
  };
}

export interface CreateOrdenDto {
  id_mesa?: number;
  id_cliente?: number;
  notas?: string;
  tipo?: "local" | "para_llevar" | "domicilio";
}

export interface AddItemDto {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  notas?: string;
}

export interface CambiarEstadoDto {
  id_estado_orden: number;
  notas?: string;
}

export interface ProcesarPagoDto {
  id_metodo_pago: number;
  monto_recibido: number;
  propina?: number;
}

export interface OrdenesResponse {
  data: Orden[];
  meta?: {
    total: number;
    pagina: number;
    por_pagina: number;
    total_paginas: number;
  };
}

/**
 * Servicio de órdenes
 */
export const ordenesService = {
  /**
   * Listar todas las órdenes
   */
  async getAll(params?: {
    estado?: number;
    mesa?: number;
    fecha?: string;
    pagina?: number;
    por_pagina?: number;
  }): Promise<OrdenesResponse> {
    return apiClient.get<OrdenesResponse>("/ordenes", params);
  },

  /**
   * Obtener órdenes activas
   */
  async getActivas(): Promise<OrdenesResponse> {
    return apiClient.get<OrdenesResponse>("/ordenes/activas");
  },

  /**
   * Obtener una orden específica
   */
  async getById(id: number): Promise<Orden> {
    return apiClient.get<Orden>(`/ordenes/${id}`);
  },

  /**
   * Crear nueva orden
   */
  async create(data: CreateOrdenDto): Promise<Orden> {
    return apiClient.post<Orden>("/ordenes", data);
  },

  /**
   * Agregar item a una orden
   */
  async addItem(ordenId: number, data: AddItemDto): Promise<Orden> {
    return apiClient.post<Orden>(`/ordenes/${ordenId}/items`, data);
  },

  /**
   * Eliminar item de una orden
   */
  async removeItem(ordenId: number, itemId: number): Promise<void> {
    return apiClient.delete(`/ordenes/${ordenId}/items/${itemId}`);
  },

  /**
   * Cambiar estado de la orden
   */
  async cambiarEstado(ordenId: number, data: CambiarEstadoDto): Promise<Orden> {
    return apiClient.patch<Orden>(`/ordenes/${ordenId}/estado`, data);
  },

  /**
   * Procesar pago de la orden
   */
  async procesarPago(ordenId: number, data: ProcesarPagoDto): Promise<any> {
    return apiClient.post(`/ordenes/${ordenId}/pagar`, data);
  },

  /**
   * Cancelar orden
   */
  async cancelar(ordenId: number, motivo?: string): Promise<void> {
    return apiClient.patch(`/ordenes/${ordenId}/estado`, {
      id_estado_orden: 7, // ID del estado 'cancelado'
      notas: motivo,
    });
  },
};
