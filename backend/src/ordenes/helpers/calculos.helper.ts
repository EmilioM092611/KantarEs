// ============== calculos.helper.ts ==============
// Para poder separar la lógica de cálculos en un helper

export class CalculosHelper {
  static calcularImpuestos(
    subtotal: number,
    tasaIva: number,
    tasaIeps: number,
  ) {
    return {
      iva: subtotal * (tasaIva / 100),
      ieps: subtotal * (tasaIeps / 100),
    };
  }

  static aplicarDescuento(
    monto: number,
    porcentaje?: number,
    montoFijo?: number,
  ): number {
    let descuento = montoFijo || 0;
    if (porcentaje && porcentaje > 0) {
      descuento += monto * (porcentaje / 100);
    }
    return Math.max(0, monto - descuento);
  }

  static calcularTotalOrden(params: {
    subtotal: number;
    descuento: number;
    iva: number;
    ieps: number;
    propina: number;
  }): number {
    return (
      params.subtotal -
      params.descuento +
      params.iva +
      params.ieps +
      params.propina
    );
  }
}
