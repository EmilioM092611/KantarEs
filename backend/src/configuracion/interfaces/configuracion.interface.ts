// backend/src/configuracion/interfaces/configuracion.interface.ts

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

export interface ConfiguracionOperativa {
  horarios: {
    [dia: string]: {
      apertura: string;
      cierre: string;
      cerrado: boolean;
    };
  };
  tiempo_espera_estimado: number; // minutos
  capacidad_maxima_personas: number;
  permite_reservaciones: boolean;
  tiempo_anticipacion_reservaciones: number; // días
  duracion_promedio_comida: number; // minutos
  alerta_tiempo_mesa_sin_atencion: number; // minutos
  tiempo_gracia_reservacion: number; // minutos
}

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

export interface Turno {
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  dias_semana: number[]; // 0=Domingo, 1=Lunes, etc.
  requiere_corte: boolean;
  activo: boolean;
}

export interface ConfiguracionTurnos {
  turnos: Turno[];
  permitir_traslape_turnos: boolean;
  requiere_corte_entre_turnos: boolean;
}
