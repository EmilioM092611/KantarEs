// backend/src/notificaciones/interfaces/notification.interface.ts

export interface NotificacionPayload {
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  canal: CanalNotificacion;
  prioridad?: PrioridadNotificacion;
  data?: any;

  // Referencias opcionales
  id_orden?: number;
  id_mesa?: number;
  id_producto?: number;
  id_usuario_destinatario?: number;
  id_usuario_origen?: number;

  // Configuración
  expira_en_minutos?: number;
  requiere_confirmacion?: boolean;
  sonido?: string;
}

export enum TipoNotificacion {
  // Órdenes
  ORDEN_NUEVA = 'orden.nueva',
  ORDEN_LISTA = 'orden.lista',
  ORDEN_CANCELADA = 'orden.cancelada',
  ORDEN_PAGADA = 'orden.pagada',

  // Inventario
  INVENTARIO_CRITICO = 'inventario.critico',
  INVENTARIO_AGOTADO = 'inventario.agotado',
  PRODUCTO_PROXIMO_VENCER = 'inventario.proximo_vencer',

  // Mesas
  MESA_SIN_ATENCION = 'mesa.sin_atencion',
  MESA_REQUIERE_LIMPIEZA = 'mesa.requiere_limpieza',
  MESA_DISPONIBLE = 'mesa.disponible',

  // Reservaciones
  RESERVACION_PROXIMA = 'reservacion.proxima',
  RESERVACION_LLEGADA = 'reservacion.llegada',
  RESERVACION_CANCELADA = 'reservacion.cancelada',

  // Cocina
  TIEMPO_PREPARACION_EXCEDIDO = 'cocina.tiempo_excedido',
  PLATILLO_LISTO = 'cocina.platillo_listo',

  // Sistema
  MENSAJE_ADMIN = 'sistema.mensaje_admin',
  CHAT_MENSAJE = 'sistema.chat',
  ALERTA_SISTEMA = 'sistema.alerta',

  // Caja
  CORTE_PENDIENTE = 'caja.corte_pendiente',
  DIFERENCIA_EFECTIVO = 'caja.diferencia',
}

export enum CanalNotificacion {
  COCINA = 'cocina',
  MESEROS = 'meseros',
  ADMIN = 'admin',
  CAJA = 'caja',
  BROADCAST = 'broadcast',
  CHAT = 'chat',
}

export enum PrioridadNotificacion {
  BAJA = 'baja',
  NORMAL = 'normal',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

export interface UsuarioConectado {
  id_usuario: number;
  username: string;
  rol: string;
  socketId: string;
  conectado_desde: Date;
}
