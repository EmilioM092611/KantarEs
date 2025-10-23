/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComparadorProveedoresService {
  constructor(private prisma: PrismaService) {}

  async compararProveedoresPorProducto(idProducto: number): Promise<any> {
    const preciosActuales =
      await this.prisma.proveedor_producto_precio.findMany({
        where: {
          id_producto: idProducto,
          activo: true,
          OR: [{ fecha_fin: null }, { fecha_fin: { gte: new Date() } }],
        },
        include: {
          proveedores: {
            select: {
              id_proveedor: true,
              nombre_comercial: true,
              calificacion: true,
              dias_credito: true,
            },
          },
          unidades_medida: true,
        },
        orderBy: { precio: 'asc' },
      });

    // Obtener histórico de compras
    const historicoCompras = await this.prisma.compra_detalle.findMany({
      where: {
        id_producto: idProducto,
        compras: {
          estado: { in: ['recibida', 'pagada'] },
        },
      },
      include: {
        compras: {
          select: {
            id_proveedor: true,
            fecha_recepcion: true,
            fecha_pedido: true,
          },
        },
      },
      orderBy: {
        compras: { fecha_recepcion: 'desc' },
      },
      take: 50,
    });

    // Calcular métricas por proveedor
    const metricas = this.calcularMetricasPorProveedor(historicoCompras);

    return {
      producto: await this.prisma.productos.findUnique({
        where: { id_producto: idProducto },
        select: { nombre: true, sku: true },
      }),
      precios_actuales: preciosActuales,
      metricas_proveedores: metricas,
      recomendacion: this.generarRecomendacion(preciosActuales, metricas),
    };
  }

  private calcularMetricasPorProveedor(compras: any[]): any {
    const metricas: any = {};

    compras.forEach((compra) => {
      const idProveedor = compra.compras.id_proveedor;

      if (!metricas[idProveedor]) {
        metricas[idProveedor] = {
          total_compras: 0,
          precio_promedio: 0,
          tiempo_entrega_promedio: 0,
          suma_precios: 0,
          suma_tiempos: 0,
        };
      }

      const dias_entrega = Math.ceil(
        (new Date(compra.compras.fecha_recepcion).getTime() -
          new Date(compra.compras.fecha_pedido).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      metricas[idProveedor].total_compras++;
      metricas[idProveedor].suma_precios += Number(compra.precio_unitario);
      metricas[idProveedor].suma_tiempos += dias_entrega;
    });

    // Calcular promedios
    Object.keys(metricas).forEach((idProveedor) => {
      const m = metricas[idProveedor];
      m.precio_promedio = m.suma_precios / m.total_compras;
      m.tiempo_entrega_promedio = Math.round(m.suma_tiempos / m.total_compras);
      delete m.suma_precios;
      delete m.suma_tiempos;
    });

    return metricas;
  }

  private generarRecomendacion(precios: any[], metricas: any): any {
    if (precios.length === 0) {
      return { mensaje: 'No hay proveedores disponibles' };
    }

    // Calcular score para cada proveedor
    const scores = precios.map((precio) => {
      const metrica = metricas[precio.id_proveedor] || {};
      let score = 0;

      // Precio (40%)
      const precioMin = Math.min(...precios.map((p) => Number(p.precio)));
      score += (precioMin / Number(precio.precio)) * 40;

      // Calificación (30%)
      score += (precio.proveedores.calificacion || 0) * 6;

      // Experiencia (15%)
      score += Math.min((metrica.total_compras || 0) / 10, 1) * 15;

      // Tiempo de entrega (15%)
      const tiempoMin = Math.min(
        precio.tiempo_entrega_dias || 3,
        metrica.tiempo_entrega_promedio || 3,
      );
      score +=
        (tiempoMin /
          (metrica.tiempo_entrega_promedio ||
            precio.tiempo_entrega_dias ||
            3)) *
        15;

      return {
        id_proveedor: precio.id_proveedor,
        nombre: precio.proveedores.nombre_comercial,
        precio: precio.precio,
        score: Math.round(score * 10) / 10,
      };
    });

    // Ordenar por score
    scores.sort((a, b) => b.score - a.score);

    return {
      proveedor_recomendado: scores[0],
      top_3: scores.slice(0, 3),
    };
  }

  async compararVariosProductos(idsProductos: number[]): Promise<any> {
    const comparaciones = await Promise.all(
      idsProductos.map((id) => this.compararProveedoresPorProducto(id)),
    );

    return comparaciones;
  }
}
