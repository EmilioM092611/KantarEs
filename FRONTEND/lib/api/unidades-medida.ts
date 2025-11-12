// FRONTEND/lib/api/unidades-medida.ts
// Servicio para gestión de unidades de medida

import { apiClient } from "./client";

// ==================== TIPOS DEL BACKEND ====================

export interface UnidadMedidaBackend {
  id_unidad: number;
  nombre: string;
  abreviatura: string;
  tipo: "PESO" | "VOLUMEN" | "UNIDAD";
  factor_conversion: number;
  _count?: {
    productos: number;
  };
}

// ==================== TIPOS DEL FRONTEND ====================

export interface UnidadMedida {
  id: number;
  nombre: string;
  abreviatura: string;
  tipo: "PESO" | "VOLUMEN" | "UNIDAD";
  factor_conversion: number;
  cantidad_productos?: number;
}

export type TipoUnidad = "PESO" | "VOLUMEN" | "UNIDAD";

export interface CreateUnidadDto {
  nombre: string;
  abreviatura: string;
  tipo: TipoUnidad;
  factor_conversion?: number;
}

export interface UpdateUnidadDto {
  nombre?: string;
  abreviatura?: string;
  tipo?: TipoUnidad;
  factor_conversion?: number;
}

// ==================== FUNCIONES DE TRANSFORMACIÓN ====================

export function transformarUnidadMedida(
  unidad: UnidadMedidaBackend
): UnidadMedida {
  return {
    id: unidad.id_unidad,
    nombre: unidad.nombre,
    abreviatura: unidad.abreviatura,
    tipo: unidad.tipo,
    factor_conversion: Number(unidad.factor_conversion),
    cantidad_productos: unidad._count?.productos,
  };
}

// ==================== SERVICIO DE UNIDADES DE MEDIDA ====================

class UnidadesMedidaService {
  private readonly endpoint = "/unidades";

  /**
   * Obtener todas las unidades de medida
   */
  async obtenerUnidades(): Promise<UnidadMedida[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: UnidadMedidaBackend[];
      }>(this.endpoint);

      return response.data.map(transformarUnidadMedida);
    } catch (error) {
      console.error("Error al obtener unidades de medida:", error);
      throw error;
    }
  }

  /**
   * Obtener unidades por tipo
   */
  async obtenerUnidadesPorTipo(tipo: TipoUnidad): Promise<UnidadMedida[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: UnidadMedidaBackend[];
      }>(`${this.endpoint}/tipo/${tipo}`);

      return response.data.map(transformarUnidadMedida);
    } catch (error) {
      console.error(`Error al obtener unidades de tipo ${tipo}:`, error);
      throw error;
    }
  }

  /**
   * Obtener una unidad de medida por ID
   */
  async obtenerUnidad(id: number): Promise<UnidadMedida> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: UnidadMedidaBackend;
      }>(`${this.endpoint}/${id}`);

      return transformarUnidadMedida(response.data);
    } catch (error) {
      console.error(`Error al obtener unidad de medida ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear una nueva unidad de medida
   */
  async crearUnidad(data: CreateUnidadDto): Promise<UnidadMedida> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: UnidadMedidaBackend;
      }>(this.endpoint, data);

      return transformarUnidadMedida(response.data);
    } catch (error: any) {
      console.error("Error al crear unidad de medida:", error);

      if (error.message.includes("409")) {
        throw new Error("La abreviatura ya está en uso");
      }

      throw error;
    }
  }

  /**
   * Actualizar una unidad de medida
   */
  async actualizarUnidad(
    id: number,
    data: UpdateUnidadDto
  ): Promise<UnidadMedida> {
    try {
      const response = await apiClient.patch<{
        success: boolean;
        message: string;
        data: UnidadMedidaBackend;
      }>(`${this.endpoint}/${id}`, data);

      return transformarUnidadMedida(response.data);
    } catch (error: any) {
      console.error(`Error al actualizar unidad de medida ${id}:`, error);

      if (error.message.includes("404")) {
        throw new Error("Unidad de medida no encontrada");
      } else if (error.message.includes("409")) {
        throw new Error("La abreviatura ya está en uso");
      }

      throw error;
    }
  }

  /**
   * Eliminar una unidad de medida
   */
  async eliminarUnidad(id: number): Promise<void> {
    try {
      await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`${this.endpoint}/${id}`);
    } catch (error: any) {
      console.error(`Error al eliminar unidad de medida ${id}:`, error);

      if (error.message.includes("409")) {
        throw new Error(
          "No se puede eliminar la unidad porque tiene productos asociados"
        );
      }

      throw error;
    }
  }
}

// Exportar instancia única del servicio
export const unidadesMedidaService = new UnidadesMedidaService();
