// FRONTEND/lib/api/configuracion.ts
// Servicio para gestión de configuración del sistema

import { apiClient } from "./client";

// ==================== TIPOS E INTERFACES ====================

/**
 * Configuración General del Restaurante
 */
export interface ConfiguracionGeneral {
  nombre_restaurante: string;
  direccion: string;
  telefono: string;
  email: string;
  rfc: string;
  logo_url?: string;
  slogan?: string;
  sitio_web?: string;
  redes_sociales?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}

/**
 * Horario de operación por día
 */
export interface HorarioDia {
  apertura: string;
  cierre: string;
  cerrado: boolean;
}

/**
 * Configuración Operativa
 */
export interface ConfiguracionOperativa {
  horarios: {
    lunes: HorarioDia;
    martes: HorarioDia;
    miercoles: HorarioDia;
    jueves: HorarioDia;
    viernes: HorarioDia;
    sabado: HorarioDia;
    domingo: HorarioDia;
  };
  tiempo_espera_estimado: number;
  capacidad_maxima_personas: number;
  permite_reservaciones: boolean;
  tiempo_anticipacion_reservaciones: number;
  duracion_promedio_comida: number;
  alerta_tiempo_mesa_sin_atencion: number;
  tiempo_gracia_reservacion: number;
}

/**
 * Configuración Fiscal
 */
export interface ConfiguracionFiscal {
  iva_tasa_default: number;
  ieps_aplicable: boolean;
  ieps_tasa_default: number;
  propina_sugerida_porcentaje: number[];
  propina_obligatoria: boolean;
  propina_tasa_obligatoria?: number;
  regimen_fiscal: string;
  lugar_expedicion: string;
  incluir_propina_en_factura: boolean;
}

/**
 * Configuración de Folios
 */
export interface ConfiguracionFolios {
  prefijo_orden: string;
  prefijo_pago: string;
  prefijo_corte: string;
  prefijo_compra: string;
  prefijo_factura: string;
  longitud_consecutivo: number;
  reiniciar_diario: boolean;
  reiniciar_mensual: boolean;
  reiniciar_anual: boolean;
}

/**
 * Configuración de Alertas
 */
export interface ConfiguracionAlertas {
  inventario: {
    dias_antes_agotamiento: number;
    porcentaje_stock_minimo_alerta: number;
    notificar_productos_proximos_vencer: boolean;
    dias_antes_vencimiento: number;
  };
  mesas: {
    minutos_sin_atencion: number;
    porcentaje_ocupacion_alta: number;
    notificar_mesa_disponible: boolean;
  };
  cocina: {
    minutos_tiempo_preparacion_excedido: number;
    notificar_orden_lista: boolean;
    notificar_orden_retrasada: boolean;
  };
  reservaciones: {
    minutos_antes_notificar: number;
    notificar_reservacion_proxima: boolean;
  };
}

/**
 * Definición de un turno
 */
export interface Turno {
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  dias_semana: number[];
  requiere_corte: boolean;
  activo: boolean;
}

/**
 * Configuración de Turnos
 */
export interface ConfiguracionTurnos {
  turnos: Turno[];
  permitir_traslape_turnos: boolean;
  requiere_corte_entre_turnos: boolean;
}

/**
 * Todas las configuraciones juntas
 */
export interface TodasConfiguraciones {
  general: ConfiguracionGeneral;
  operativa: ConfiguracionOperativa;
  fiscal: ConfiguracionFiscal;
  folios: ConfiguracionFolios;
  alertas: ConfiguracionAlertas;
  turnos: ConfiguracionTurnos;
}

// ==================== DTOs PARA ACTUALIZACIÓN ====================

export type UpdateConfiguracionGeneralDto = Partial<ConfiguracionGeneral>;
export type UpdateConfiguracionOperativaDto = Partial<ConfiguracionOperativa>;
export type UpdateConfiguracionFiscalDto = Partial<ConfiguracionFiscal>;
export type UpdateConfiguracionFoliosDto = Partial<ConfiguracionFolios>;
export type UpdateConfiguracionAlertasDto = Partial<ConfiguracionAlertas>;
export type UpdateConfiguracionTurnosDto = Partial<ConfiguracionTurnos>;

// ==================== SERVICIO DE CONFIGURACIÓN ====================

class ConfiguracionService {
  private readonly endpoint = "/configuracion";

  // ==================== CONFIGURACIÓN GENERAL ====================

  /**
   * Obtener configuración general
   */
  async obtenerGeneral(): Promise<ConfiguracionGeneral> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ConfiguracionGeneral;
      }>(`${this.endpoint}/general`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener configuración general:", error);
      throw error;
    }
  }

  /**
   * Actualizar configuración general
   */
  async actualizarGeneral(
    data: UpdateConfiguracionGeneralDto
  ): Promise<ConfiguracionGeneral> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        message: string;
        data: ConfiguracionGeneral;
      }>(`${this.endpoint}/general`, data);
      return response.data;
    } catch (error: any) {
      console.error("Error al actualizar configuración general:", error);

      if (error.message.includes("403")) {
        throw new Error("No tienes permisos para actualizar la configuración");
      }

      throw error;
    }
  }

  // ==================== CONFIGURACIÓN OPERATIVA ====================

  /**
   * Obtener configuración operativa
   */
  async obtenerOperativa(): Promise<ConfiguracionOperativa> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ConfiguracionOperativa;
      }>(`${this.endpoint}/operativa`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener configuración operativa:", error);
      throw error;
    }
  }

  /**
   * Actualizar configuración operativa
   */
  async actualizarOperativa(
    data: UpdateConfiguracionOperativaDto
  ): Promise<ConfiguracionOperativa> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        message: string;
        data: ConfiguracionOperativa;
      }>(`${this.endpoint}/operativa`, data);
      return response.data;
    } catch (error: any) {
      console.error("Error al actualizar configuración operativa:", error);

      if (error.message.includes("403")) {
        throw new Error("No tienes permisos para actualizar la configuración");
      }

      throw error;
    }
  }

  // ==================== CONFIGURACIÓN FISCAL ====================

  /**
   * Obtener configuración fiscal
   */
  async obtenerFiscal(): Promise<ConfiguracionFiscal> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ConfiguracionFiscal;
      }>(`${this.endpoint}/fiscal`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener configuración fiscal:", error);
      throw error;
    }
  }

  /**
   * Actualizar configuración fiscal
   */
  async actualizarFiscal(
    data: UpdateConfiguracionFiscalDto
  ): Promise<ConfiguracionFiscal> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        message: string;
        data: ConfiguracionFiscal;
      }>(`${this.endpoint}/fiscal`, data);
      return response.data;
    } catch (error: any) {
      console.error("Error al actualizar configuración fiscal:", error);

      if (error.message.includes("403")) {
        throw new Error("No tienes permisos para actualizar la configuración");
      }

      throw error;
    }
  }

  // ==================== CONFIGURACIÓN DE FOLIOS ====================

  /**
   * Obtener configuración de folios
   */
  async obtenerFolios(): Promise<ConfiguracionFolios> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ConfiguracionFolios;
      }>(`${this.endpoint}/folios`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener configuración de folios:", error);
      throw error;
    }
  }

  /**
   * Actualizar configuración de folios
   */
  async actualizarFolios(
    data: UpdateConfiguracionFoliosDto
  ): Promise<ConfiguracionFolios> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        message: string;
        data: ConfiguracionFolios;
      }>(`${this.endpoint}/folios`, data);
      return response.data;
    } catch (error: any) {
      console.error("Error al actualizar configuración de folios:", error);

      if (error.message.includes("403")) {
        throw new Error("No tienes permisos para actualizar la configuración");
      }

      throw error;
    }
  }

  // ==================== CONFIGURACIÓN DE ALERTAS ====================

  /**
   * Obtener configuración de alertas
   */
  async obtenerAlertas(): Promise<ConfiguracionAlertas> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ConfiguracionAlertas;
      }>(`${this.endpoint}/alertas`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener configuración de alertas:", error);
      throw error;
    }
  }

  /**
   * Actualizar configuración de alertas
   */
  async actualizarAlertas(
    data: UpdateConfiguracionAlertasDto
  ): Promise<ConfiguracionAlertas> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        message: string;
        data: ConfiguracionAlertas;
      }>(`${this.endpoint}/alertas`, data);
      return response.data;
    } catch (error: any) {
      console.error("Error al actualizar configuración de alertas:", error);

      if (error.message.includes("403")) {
        throw new Error("No tienes permisos para actualizar la configuración");
      }

      throw error;
    }
  }

  // ==================== CONFIGURACIÓN DE TURNOS ====================

  /**
   * Obtener configuración de turnos
   */
  async obtenerTurnos(): Promise<ConfiguracionTurnos> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ConfiguracionTurnos;
      }>(`${this.endpoint}/turnos`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener configuración de turnos:", error);
      throw error;
    }
  }

  /**
   * Actualizar configuración de turnos
   */
  async actualizarTurnos(
    data: UpdateConfiguracionTurnosDto
  ): Promise<ConfiguracionTurnos> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        message: string;
        data: ConfiguracionTurnos;
      }>(`${this.endpoint}/turnos`, data);
      return response.data;
    } catch (error: any) {
      console.error("Error al actualizar configuración de turnos:", error);

      if (error.message.includes("403")) {
        throw new Error("No tienes permisos para actualizar la configuración");
      }

      throw error;
    }
  }

  // ==================== MÉTODOS GLOBALES ====================

  /**
   * Obtener todas las configuraciones
   */
  async obtenerTodas(): Promise<TodasConfiguraciones> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: TodasConfiguraciones;
      }>(`${this.endpoint}/todas`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener todas las configuraciones:", error);
      throw error;
    }
  }

  /**
   * Restaurar configuraciones a valores por defecto
   */
  async restaurarDefaults(): Promise<{
    message: string;
    configuraciones_restauradas: string[];
  }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        configuraciones_restauradas: string[];
      }>(`${this.endpoint}/restaurar-defaults`);

      return {
        message: response.message,
        configuraciones_restauradas: response.configuraciones_restauradas,
      };
    } catch (error: any) {
      console.error("Error al restaurar configuraciones:", error);

      if (error.message.includes("403")) {
        throw new Error(
          "No tienes permisos para restaurar las configuraciones"
        );
      }

      throw error;
    }
  }

  /**
   * Limpiar caché de configuración
   */
  async limpiarCache(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>(`${this.endpoint}/limpiar-cache`);

      return { message: response.message };
    } catch (error: any) {
      console.error("Error al limpiar caché:", error);

      if (error.message.includes("403")) {
        throw new Error("No tienes permisos para limpiar el caché");
      }

      throw error;
    }
  }
}

// Exportar instancia única del servicio
export const configuracionService = new ConfiguracionService();
