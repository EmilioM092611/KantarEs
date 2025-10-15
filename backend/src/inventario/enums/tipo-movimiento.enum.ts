export enum TipoMovimientoNombre {
  ENTRADA_COMPRA = 'Entrada por compra',
  SALIDA_VENTA = 'Salida por venta',
  AJUSTE_INVENTARIO = 'Ajuste de inventario',
  MERMA = 'Merma',
  DEVOLUCION_PROVEEDOR = 'Devolución a proveedor',
  DEVOLUCION_CLIENTE = 'Devolución de cliente',
  TRANSFERENCIA = 'Transferencia entre almacenes',
  ENTRADA_INICIAL = 'Entrada inicial',
  SALIDA_CADUCIDAD = 'Salida por caducidad',
}

export enum AfectaInventario {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  NEUTRO = 'neutro',
}
