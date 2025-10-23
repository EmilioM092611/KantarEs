export interface EstacionKDS {
  id_estacion: number;
  nombre: string;
  descripcion?: string;
  color_hex: string;
  orden_visualizacion: number;
  muestra_todas_ordenes: boolean;
  muestra_solo_asignadas: boolean;
  filtro_categorias?: number[];
  filtro_tipos_producto?: number[];
  tiempo_alerta_minutos: number;
  sonido_alerta: string;
  items_por_pagina: number;
  mostrar_notas: boolean;
  mostrar_mesero: boolean;
  mostrar_tiempo: boolean;
  activo: boolean;
}

export interface OrdenItemKDS {
  id_kds_item: number;
  id_orden_detalle: number;
  id_estacion: number;
  estado: EstadoItemKDS;
  prioridad: number;
  tiempo_estimado_minutos?: number;
  fecha_hora_recibido: Date;
  fecha_hora_iniciado?: Date;
  fecha_hora_completado?: Date;
  id_usuario_prepara?: number;
  alerta_tiempo_excedido: boolean;
  requiere_atencion: boolean;
  posicion_pantalla?: number;
}

export enum EstadoItemKDS {
  PENDIENTE = 'pendiente',
  PREPARANDO = 'preparando',
  LISTO = 'listo',
  SERVIDO = 'servido',
  CANCELADO = 'cancelado',
}

export enum TipoLayout {
  GRID = 'grid',
  LIST = 'list',
  KANBAN = 'kanban',
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export interface ConfiguracionDisplay {
  id_config: number;
  nombre_display: string;
  id_estacion: number;
  ip_address?: string;
  mac_address?: string;
  ultimo_ping?: Date;
  layout_tipo: TipoLayout;
  columnas: number;
  theme: Theme;
  tamano_fuente: 'small' | 'medium' | 'large';
  mostrar_imagenes: boolean;
  permite_cambiar_prioridad: boolean;
  permite_cancelar: boolean;
  auto_refresh_segundos: number;
  bump_bar_habilitado: boolean;
  bump_bar_puerto?: string;
  activo: boolean;
}

export interface TicketKDS {
  id_orden: number;
  folio: string;
  mesa?: string;
  mesero: string;
  fecha_hora_orden: Date;
  items: ItemTicketKDS[];
  tiempo_total_espera: number;
  prioridad_maxima: number;
  tiene_alertas: boolean;
  porcentaje_completado: number;
}

export interface ItemTicketKDS {
  id_kds_item: number;
  id_orden_detalle: number;
  producto: string;
  cantidad: number;
  estado: EstadoItemKDS;
  notas?: string;
  tiempo_espera_minutos: number;
  tiempo_estimado_minutos?: number;
  alerta: boolean;
  prioridad: number;
  imagen_url?: string;
}

export interface EstadisticasKDS {
  items_activos: number;
  items_pendientes: number;
  items_preparando: number;
  items_listos: number;
  tiempo_promedio_preparacion: number;
  items_con_alerta: number;
  ordenes_activas: number;
  por_estacion: {
    [estacion: string]: {
      activos: number;
      pendientes: number;
      preparando: number;
      tiempo_promedio: number;
    };
  };
}
