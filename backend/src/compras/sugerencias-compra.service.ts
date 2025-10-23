/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { subDays, subMonths } from 'date-fns';

@Injectable()
export class SugerenciasCompraService {
  constructor(private prisma: PrismaService) {}

  async analizarConsumoHistorico(
    idProducto: number,
    diasAnalisis: number = 90,
  ): Promise<any> {
    const fechaInicio = subDays(new Date(), diasAnalisis);

    // Obtener movimientos de salida (ventas/consumo)
    const movimientos = await this.prisma.movimientos_inventario.findMany({
      where: {
        id_producto: idProducto,
        tipos_movimiento: {
          afecta_inventario: 'resta',
        },
        fecha_movimiento: { gte: fechaInicio },
      },
      orderBy: { fecha_movimiento: 'asc' },
    });

    if (movimientos.length === 0) {
      return {
        mensaje: 'No hay suficiente historial de consumo',
        dias_analizados: diasAnalisis,
      };
    }

    // Calcular consumo promedio diario
    const totalConsumido = movimientos.reduce(
      (sum, mov) => sum + Number(mov.cantidad),
      0,
    );
    const consumoPromedioDiario = totalConsumido / diasAnalisis;

    // Calcular días de inventario actual
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: idProducto },
      select: {
        nombre: true,
        sku: true,
        inventario: {
          select: {
            stock_actual: true,
          },
        },
      },
    });

    if (!producto || !producto.inventario) {
      return {
        mensaje: 'Producto no encontrado o sin inventario',
      };
    }

    const stockActual = Number(producto.inventario.stock_actual);
    const diasInventario =
      consumoPromedioDiario > 0 ? stockActual / consumoPromedioDiario : 999;

    // Predicción de agotamiento
    const fechaAgotamiento = new Date();
    fechaAgotamiento.setDate(
      fechaAgotamiento.getDate() + Math.floor(diasInventario),
    );

    // Calcular cantidad sugerida (para 30 días)
    const diasCobertura = 30;
    const cantidadSugerida = Math.ceil(consumoPromedioDiario * diasCobertura);

    return {
      producto: {
        id: idProducto,
        nombre: producto.nombre,
        sku: producto.sku,
      },
      analisis: {
        dias_analizados: diasAnalisis,
        total_consumido: totalConsumido,
        consumo_promedio_diario: Math.round(consumoPromedioDiario * 100) / 100,
        stock_actual: stockActual,
        dias_inventario_actual: Math.round(diasInventario * 10) / 10,
        fecha_agotamiento_estimada:
          diasInventario < 999 ? fechaAgotamiento : null,
      },
      sugerencia: {
        cantidad_sugerida: cantidadSugerida,
        dias_cobertura: diasCobertura,
        prioridad: this.determinarPrioridad(diasInventario),
      },
    };
  }

  private determinarPrioridad(diasInventario: number): string {
    if (diasInventario <= 7) return 'Urgente';
    if (diasInventario <= 15) return 'Alta';
    if (diasInventario <= 30) return 'Media';
    return 'Baja';
  }

  async predecirDemanda(
    idProducto: number,
    diasFuturos: number = 30,
  ): Promise<any> {
    // Obtener últimos 6 meses de datos
    const fechaInicio = subMonths(new Date(), 6);

    const movimientos = await this.prisma.movimientos_inventario.findMany({
      where: {
        id_producto: idProducto,
        tipos_movimiento: {
          afecta_inventario: 'resta',
        },
        fecha_movimiento: { gte: fechaInicio },
      },
      select: {
        cantidad: true,
        fecha_movimiento: true,
      },
    });

    // Agrupar por mes
    const consumoPorMes: { [key: string]: number } = {};

    movimientos.forEach((mov) => {
      const mes = mov.fecha_movimiento.toISOString().substr(0, 7); // YYYY-MM
      consumoPorMes[mes] = (consumoPorMes[mes] || 0) + Number(mov.cantidad);
    });

    const meses = Object.keys(consumoPorMes).sort();
    const consumos = meses.map((mes) => consumoPorMes[mes]);

    // Calcular tendencia (regresión lineal simple)
    const n = consumos.length;
    if (n < 3) {
      return {
        mensaje: 'Insuficientes datos para predicción',
        datos_disponibles: n,
      };
    }

    const sumX = (n * (n + 1)) / 2;
    const sumY = consumos.reduce((a, b) => a + b, 0);
    const sumXY = consumos.reduce((sum, y, x) => sum + (x + 1) * y, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercepto = (sumY - pendiente * sumX) / n;

    // Predecir próximo mes
    const prediccionProximoMes = Math.max(0, pendiente * (n + 1) + intercepto);

    // Calcular cantidad sugerida para los próximos días
    const consumoDiarioPredictivo = prediccionProximoMes / 30;
    const cantidadSugerida = Math.ceil(consumoDiarioPredictivo * diasFuturos);

    return {
      historico: {
        meses_analizados: meses,
        consumos: consumos,
      },
      tendencia: {
        direccion:
          pendiente > 0.1
            ? 'creciente'
            : pendiente < -0.1
              ? 'decreciente'
              : 'estable',
        pendiente: Math.round(pendiente * 100) / 100,
      },
      prediccion: {
        consumo_proximo_mes: Math.round(prediccionProximoMes * 10) / 10,
        consumo_diario_estimado:
          Math.round(consumoDiarioPredictivo * 100) / 100,
        cantidad_sugerida: cantidadSugerida,
        para_dias: diasFuturos,
      },
    };
  }

  async optimizarCantidadPedido(
    idProducto: number,
    idProveedor?: number,
  ): Promise<any> {
    const [producto, consumo, precios] = await Promise.all([
      this.prisma.productos.findUnique({
        where: { id_producto: idProducto },
        include: { inventario: true },
      }),
      this.analizarConsumoHistorico(idProducto),
      this.prisma.proveedor_producto_precio.findMany({
        where: {
          id_producto: idProducto,
          activo: true,
          ...(idProveedor && { id_proveedor: idProveedor }),
        },
        include: { proveedores: true },
      }),
    ]);

    if (!producto) {
      return { mensaje: 'Producto no encontrado' };
    }

    if (precios.length === 0) {
      return {
        mensaje: 'No hay información de precios disponible',
      };
    }

    // Modelo EOQ (Economic Order Quantity) simplificado
    const D = (consumo.analisis?.consumo_promedio_diario || 1) * 365; // Demanda anual
    const S = 150; // Costo de orden (estimado)
    const H = Number(precios[0].precio) * 0.25; // Costo de almacenamiento (25% del precio)

    const EOQ = Math.sqrt((2 * D * S) / H);

    // Punto de reorden (Reorder Point)
    const L = precios[0].tiempo_entrega_dias || 7; // Lead time
    const ROP = (consumo.analisis?.consumo_promedio_diario || 0) * L;

    return {
      producto: {
        id: idProducto,
        nombre: producto.nombre,
      },
      analisis_economico: {
        demanda_anual: Math.round(D),
        costo_orden: S,
        costo_almacenamiento_unitario: Math.round(H * 100) / 100,
      },
      recomendacion: {
        cantidad_economica_pedido: Math.round(EOQ),
        punto_reorden: Math.round(ROP),
        frecuencia_pedidos_anual: Math.round(D / EOQ),
        tiempo_entrega_dias: L,
      },
      proveedor_recomendado: {
        nombre: precios[0].proveedores.nombre_comercial,
        precio: precios[0].precio,
      },
    };
  }

  async generarOrdenSugerida(): Promise<any> {
    // Obtener productos bajo stock
    const productos = await this.prisma.productos.findMany({
      where: {
        AND: [
          { es_inventariable: true },
          { disponible: true },
          {
            inventario: {
              stock_actual: {
                lte: this.prisma.inventario.fields.stock_minimo,
              },
            },
          },
        ],
      },
      include: {
        inventario: true,
      },
      take: 20,
    });

    const sugerencias = await Promise.all(
      productos.map(async (producto) => {
        if (!producto.inventario) return null;

        const analisis = await this.analizarConsumoHistorico(
          producto.id_producto,
        );

        const mejor_proveedor =
          await this.prisma.proveedor_producto_precio.findFirst({
            where: {
              id_producto: producto.id_producto,
              activo: true,
            },
            include: { proveedores: true },
            orderBy: [{ es_preferido: 'desc' }, { precio: 'asc' }],
          });

        const stockActual = Number(producto.inventario.stock_actual);
        const stockMaximo = Number(producto.inventario.stock_maximo || 0);
        const cantidadSugerida =
          analisis.sugerencia?.cantidad_sugerida || stockMaximo - stockActual;

        return {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          sku: producto.sku,
          stock_actual: stockActual,
          cantidad_sugerida: cantidadSugerida,
          proveedor: mejor_proveedor
            ? {
                id: mejor_proveedor.proveedores.id_proveedor,
                nombre: mejor_proveedor.proveedores.nombre_comercial,
                precio: mejor_proveedor.precio,
              }
            : null,
          prioridad: analisis.sugerencia?.prioridad || 'Media',
        };
      }),
    );

    // Filtrar nulls
    const sugerenciasFiltradas = sugerencias.filter((s) => s !== null);

    // Agrupar por proveedor
    const porProveedor: any = {};

    sugerenciasFiltradas.forEach((sug: any) => {
      if (!sug.proveedor) return;

      const idProv = sug.proveedor.id;
      if (!porProveedor[idProv]) {
        porProveedor[idProv] = {
          proveedor: sug.proveedor.nombre,
          productos: [],
          total_estimado: 0,
        };
      }

      const subtotal = sug.cantidad_sugerida * Number(sug.proveedor.precio);
      porProveedor[idProv].productos.push({
        ...sug,
        subtotal,
      });
      porProveedor[idProv].total_estimado += subtotal;
    });

    return {
      fecha_generacion: new Date(),
      total_productos: sugerenciasFiltradas.length,
      ordenes_sugeridas_por_proveedor: Object.values(porProveedor),
    };
  }
}
