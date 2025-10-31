// FRONTEND/lib/api/productos.ts
// Servicio para gestión de productos

import { apiClient } from "./client";

// Tipos de datos
export interface Producto {
  id_producto: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  precio_venta: number;
  id_categoria?: number;
  disponible: boolean;
  imagen_url?: string;
  categorias?: {
    nombre: string;
  };
}

export interface CreateProductoDto {
  sku: string;
  nombre: string;
  descripcion?: string;
  precio_venta: number;
  precio_compra?: number;
  id_categoria?: number;
  id_unidad_medida?: number;
  iva_tasa?: number;
  imagen_url?: string;
}

export interface UpdateProductoDto {
  nombre?: string;
  descripcion?: string;
  precio_venta?: number;
  id_categoria?: number;
  disponible?: boolean;
  imagen_url?: string;
}

export interface ProductosResponse {
  data: Producto[];
  meta?: {
    total: number;
    pagina: number;
    por_pagina: number;
    total_paginas: number;
  };
}

/**
 * Servicio de productos
 */
export const productosService = {
  /**
   * Listar todos los productos
   */
  async getAll(params?: {
    categoria?: number;
    disponible?: boolean;
    buscar?: string;
    pagina?: number;
    por_pagina?: number;
  }): Promise<ProductosResponse> {
    return apiClient.get<ProductosResponse>("/productos", params);
  },

  /**
   * Obtener un producto específico
   */
  async getById(id: number): Promise<Producto> {
    return apiClient.get<Producto>(`/productos/${id}`);
  },

  /**
   * Crear nuevo producto
   */
  async create(data: CreateProductoDto): Promise<Producto> {
    return apiClient.post<Producto>("/productos", data);
  },

  /**
   * Actualizar producto
   */
  async update(id: number, data: UpdateProductoDto): Promise<Producto> {
    return apiClient.patch<Producto>(`/productos/${id}`, data);
  },

  /**
   * Eliminar producto (soft delete)
   */
  async delete(id: number): Promise<void> {
    return apiClient.delete(`/productos/${id}`);
  },

  /**
   * Activar producto
   */
  async activar(id: number): Promise<Producto> {
    return apiClient.post<Producto>(`/productos/${id}/activar`);
  },

  /**
   * Desactivar producto
   */
  async desactivar(id: number): Promise<Producto> {
    return apiClient.post<Producto>(`/productos/${id}/desactivar`);
  },
};
