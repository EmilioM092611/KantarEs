// FRONTEND/lib/api/categorias.ts
// Servicio para gestión de categorías de productos

import { apiClient } from "./client";

export interface CategoriaBackend {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  id_categoria_padre: number | null;
  id_tipo_producto: number | null;
  imagen_url: string | null;
  orden_visualizacion: number | null;
  visible_menu: boolean;
  activa: boolean;
  _count?: {
    productos: number;
  };
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  orden: number;
  visible: boolean;
  activa: boolean;
  id_padre?: number;
  cantidad_productos?: number;
}

export type AreaPreparacion = "cocina" | "barra" | "ninguna";

export interface CreateCategoriaDto {
  nombre: string;
  descripcion?: string;
  requiere_preparacion?: boolean;
  area_preparacion?: AreaPreparacion;
  orden_menu?: number;
  icono?: string;
  activo?: boolean;
}

export interface UpdateCategoriaDto {
  nombre?: string;
  descripcion?: string;
  requiere_preparacion?: boolean;
  area_preparacion?: AreaPreparacion;
  orden_menu?: number;
  icono?: string;
  activo?: boolean;
}

export function transformarCategoria(categoria: CategoriaBackend): Categoria {
  return {
    id: categoria.id_categoria,
    nombre: categoria.nombre,
    descripcion: categoria.descripcion || undefined,
    imagen: categoria.imagen_url || undefined,
    orden: categoria.orden_visualizacion || 0,
    visible: categoria.visible_menu,
    activa: categoria.activa,
    id_padre: categoria.id_categoria_padre || undefined,
    cantidad_productos: categoria._count?.productos,
  };
}

class CategoriasService {
  private readonly endpoint = "/categorias";

  async obtenerCategorias(activo?: boolean): Promise<Categoria[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: CategoriaBackend[];
      }>(
        this.endpoint,
        activo !== undefined ? { activo: activo.toString() } : undefined
      );

      return response.data.map(transformarCategoria);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      throw error;
    }
  }

  async obtenerCategoriasActivas(): Promise<Categoria[]> {
    return this.obtenerCategorias(true);
  }

  async obtenerCategoriasConProductos(): Promise<Categoria[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: CategoriaBackend[];
      }>(`${this.endpoint}/con-productos`);

      return response.data.map(transformarCategoria);
    } catch (error) {
      console.error("Error al obtener categorías con productos:", error);
      throw error;
    }
  }

  async obtenerCategoriasMenu(): Promise<Categoria[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: CategoriaBackend[];
      }>(`${this.endpoint}/menu`);

      return response.data.map(transformarCategoria);
    } catch (error) {
      console.error("Error al obtener categorías del menú:", error);
      throw error;
    }
  }

  async obtenerCategoria(id: number): Promise<Categoria> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: CategoriaBackend;
      }>(`${this.endpoint}/${id}`);

      return transformarCategoria(response.data);
    } catch (error) {
      console.error(`Error al obtener categoría ${id}:`, error);
      throw error;
    }
  }

  async obtenerProductosCategoria(id: number): Promise<any[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
      }>(`${this.endpoint}/${id}/productos`);

      return response.data;
    } catch (error) {
      console.error(`Error al obtener productos de la categoría ${id}:`, error);
      throw error;
    }
  }

  async crearCategoria(data: CreateCategoriaDto): Promise<Categoria> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: CategoriaBackend;
      }>(this.endpoint, data);

      return transformarCategoria(response.data);
    } catch (error: any) {
      console.error("Error al crear categoría:", error);

      if (error.message.includes("409")) {
        throw new Error("Ya existe una categoría con ese nombre");
      }

      throw error;
    }
  }

  async actualizarCategoria(
    id: number,
    data: UpdateCategoriaDto
  ): Promise<Categoria> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        message: string;
        data: CategoriaBackend;
      }>(`${this.endpoint}/${id}`, data);

      return transformarCategoria(response.data);
    } catch (error: any) {
      console.error(`Error al actualizar categoría ${id}:`, error);

      if (error.message.includes("404")) {
        throw new Error("Categoría no encontrada");
      } else if (error.message.includes("409")) {
        throw new Error("Ya existe una categoría con ese nombre");
      }

      throw error;
    }
  }

  async eliminarCategoria(id: number): Promise<void> {
    try {
      await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error al eliminar categoría ${id}:`, error);
      throw error;
    }
  }

  async activarCategoria(id: number): Promise<Categoria> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: CategoriaBackend;
      }>(`${this.endpoint}/${id}/activar`);

      return transformarCategoria(response.data);
    } catch (error) {
      console.error(`Error al activar categoría ${id}:`, error);
      throw error;
    }
  }

  async desactivarCategoria(id: number): Promise<Categoria> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: CategoriaBackend;
      }>(`${this.endpoint}/${id}/desactivar`);

      return transformarCategoria(response.data);
    } catch (error) {
      console.error(`Error al desactivar categoría ${id}:`, error);
      throw error;
    }
  }

  async reordenarCategorias(
    categorias: { id: number; orden: number }[]
  ): Promise<void> {
    try {
      await apiClient.patch<{
        success: boolean;
        message: string;
      }>(`${this.endpoint}/reordenar`, { categorias });
    } catch (error) {
      console.error("Error al reordenar categorías:", error);
      throw error;
    }
  }
}

export const categoriasService = new CategoriasService();
