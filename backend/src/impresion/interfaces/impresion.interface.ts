// backend/src/impresion/interfaces/impresion.interface.ts

export interface ConfiguracionImpresora {
  id_impresora: number;
  nombre: string;
  tipo: TipoImpresora;
  tipo_conexion: TipoConexion;
  ip_address?: string;
  puerto?: number;
  ruta_usb?: string;
  mac_address?: string;
  estacion: string;
  ancho_papel: number;
  auto_corte: boolean;
  auto_imprimir: boolean;
  copias: number;
  template_comanda: string;
  template_ticket: string;
  activa: boolean;
}

export enum TipoImpresora {
  TERMICA = 'TERMICA',
  LASER = 'LASER',
  PDF = 'PDF',
}

export enum TipoConexion {
  RED = 'RED',
  USB = 'USB',
  BLUETOOTH = 'BLUETOOTH',
}

export enum TipoDocumento {
  COMANDA = 'comanda',
  TICKET = 'ticket',
  CORTE = 'corte',
  REPORTE = 'reporte',
}

export enum EstadoTrabajo {
  PENDIENTE = 'pendiente',
  IMPRIMIENDO = 'imprimiendo',
  COMPLETADO = 'completado',
  ERROR = 'error',
  CANCELADO = 'cancelado',
}

export interface TrabajoImpresion {
  id_trabajo?: number;
  id_impresora: number;
  tipo_documento: TipoDocumento;
  contenido: string;
  formato: string;
  id_orden?: number;
  id_corte?: number;
  id_usuario?: number;
  estado?: EstadoTrabajo;
  intentos?: number;
  max_intentos?: number;
}

export interface DatosComanda {
  numero_orden: string;
  mesa: string;
  mesero: string;
  fecha_hora: Date;
  items: ItemComanda[];
  notas?: string;
}

export interface ItemComanda {
  cantidad: number;
  nombre: string;
  notas?: string;
}

export interface DatosTicket {
  numero_orden: string;
  fecha_hora: Date;
  mesa?: string;
  mesero: string;
  items: ItemTicket[];
  subtotal: number;
  descuento: number;
  impuestos: number;
  propina: number;
  total: number;
  metodo_pago: string;
  notas?: string;
}

export interface ItemTicket {
  cantidad: number;
  nombre: string;
  precio_unitario: number;
  subtotal: number;
}
