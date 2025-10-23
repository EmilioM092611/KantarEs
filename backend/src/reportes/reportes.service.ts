/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  QueryVentasDto,
  QueryProductosTopDto,
  QueryComparativoDto,
  QueryAnalisisMeseroDto,
  QueryHorasPicoDto,
  PeriodoComparacion,
  QueryReportesBaseDto,
} from './dto/query-reportes.dto';
import { SugerenciasCompraDto } from './dto/sugerencias-compra.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==================== DASHBOARD EJECUTIVO ====================

  /**
   * Dashboard ejecutivo con KPIs principales
   */
  async getDashboard() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);

    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const finAyer = new Date(ayer);
    finAyer.setHours(23, 59, 59, 999);

    // Ejecutar todas las queries en paralelo
    const [
      ventasHoy,
      ventasAyer,
      ordenesPagadas,
      mesasEstado,
      stockCritico,
      propinas,
      ventasMes,
      ventasMesAnterior,
      tendencia,
      productosTop,
      horasPico,
    ] = await Promise.all([
      this.getVentasPeriodo(hoy, finHoy),
      this.getVentasPeriodo(ayer, finAyer),
      this.getOrdenesDelDia(hoy, finHoy),
      this.getEstadoMesasResumen(),
      this.getProductosStockCritico(),
      this.getPropinasPeriodo(hoy, finHoy),
      this.getVentasMesActual(),
      this.getVentasMesAnterior(),
      this.getTendencia7Dias(),
      this.getProductosTopSimple(5),
      this.getHorasPicoHoy(),
    ]);

    // Calcular KPIs
    const totalVentasHoy = Number(ventasHoy._sum.total || 0);
    const totalVentasAyer = Number(ventasAyer._sum.total || 0);
    const variacionVsAyer =
      totalVentasAyer > 0
        ? ((totalVentasHoy - totalVentasAyer) / totalVentasAyer) * 100
        : 0;

    const totalVentasMes = Number(ventasMes._sum.total || 0);
    const totalVentasMesAnterior = Number(ventasMesAnterior._sum.total || 0);
    const variacionVsMes =
      totalVentasMesAnterior > 0
        ? ((totalVentasMes - totalVentasMesAnterior) / totalVentasMesAnterior) *
          100
        : 0;

    const ticketPromedio =
      ordenesPagadas._count > 0 ? totalVentasHoy / ordenesPagadas._count : 0;

    // Generar alertas
    const alertas = this.generarAlertas({
      stockCritico: stockCritico.length,
      variacionVsAyer,
      mesasOcupadas: mesasEstado.ocupadas,
      mesasTotales: mesasEstado.totales,
    });

    return {
      kpis: {
        ventas_hoy: totalVentasHoy,
        variacion_vs_ayer: parseFloat(variacionVsAyer.toFixed(2)),
        ordenes_hoy: ordenesPagadas._count,
        ticket_promedio: parseFloat(ticketPromedio.toFixed(2)),
        mesas_ocupadas: mesasEstado.ocupadas,
        mesas_totales: mesasEstado.totales,
        porcentaje_ocupacion: parseFloat(
          ((mesasEstado.ocupadas / mesasEstado.totales) * 100).toFixed(2),
        ),
        productos_stock_critico: stockCritico.length,
        propinas_totales: Number(propinas._sum.propina || 0),
        ventas_mes_actual: totalVentasMes,
        variacion_vs_mes_anterior: parseFloat(variacionVsMes.toFixed(2)),
      },
      tendencia_7_dias: tendencia,
      productos_top_5: productosTop,
      horas_pico: horasPico,
      alertas,
    };
  }

  // ==================== VENTAS ====================

  /**
   * Reporte detallado de ventas con agrupaciones
   */
  async getReporteVentas(query: QueryVentasDto) {
    const fechaInicio = query.fecha_inicio
      ? new Date(query.fecha_inicio)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const fechaFin = query.fecha_fin ? new Date(query.fecha_fin) : new Date();
    fechaFin.setHours(23, 59, 59, 999);

    const where: any = {
      fecha_hora_orden: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    };

    if (!query.incluir_canceladas) {
      where.estados_orden = {
        nombre: {
          not: 'cancelada',
        },
      };
    }

    // Según agrupación
    switch (query.agrupar_por) {
      case 'hora':
        return this.getVentasPorHora(fechaInicio, fechaFin, where);
      case 'dia':
        return this.getVentasPorDia(fechaInicio, fechaFin, where);
      case 'semana':
        return this.getVentasPorSemana(fechaInicio, fechaFin, where);
      case 'mes':
        return this.getVentasPorMes(fechaInicio, fechaFin, where);
      case 'categoria':
        return this.getVentasPorCategoria(fechaInicio, fechaFin, where);
      case 'mesero':
        return this.getVentasPorMesero(fechaInicio, fechaFin, where);
      default:
        return this.getVentasResumen(fechaInicio, fechaFin, where);
    }
  }

  /**
   * Ventas agrupadas por hora del día
   */
  private async getVentasPorHora(inicio: Date, fin: Date, where: any) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        EXTRACT(HOUR FROM o.fecha_hora_orden) as hora,
        COUNT(DISTINCT o.id_orden) as total_ordenes,
        SUM(o.subtotal) as subtotal,
        SUM(o.total) as total_ventas,
        AVG(o.total) as ticket_promedio,
        COUNT(DISTINCT o.id_sesion_mesa) as mesas_atendidas
      FROM ordenes o
      INNER JOIN estados_orden eo ON o.id_estado_orden = eo.id_estado_orden
      WHERE o.fecha_hora_orden >= ${inicio}
        AND o.fecha_hora_orden <= ${fin}
        AND eo.nombre != 'cancelada'
      GROUP BY EXTRACT(HOUR FROM o.fecha_hora_orden)
      ORDER BY hora
    `;

    return {
      periodo: { inicio, fin },
      agrupacion: 'hora',
      datos: result.map((r) => ({
        hora: Number(r.hora),
        total_ordenes: Number(r.total_ordenes),
        subtotal: Number(r.subtotal || 0),
        total_ventas: Number(r.total_ventas || 0),
        ticket_promedio: Number(r.ticket_promedio || 0),
        mesas_atendidas: Number(r.mesas_atendidas),
      })),
    };
  }

  /**
   * Ventas agrupadas por día
   */
  private async getVentasPorDia(inicio: Date, fin: Date, where: any) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        DATE(o.fecha_hora_orden) as fecha,
        TO_CHAR(o.fecha_hora_orden, 'Day') as dia_semana,
        COUNT(DISTINCT o.id_orden) as total_ordenes,
        SUM(o.subtotal) as subtotal,
        SUM(o.descuento_monto) as descuentos,
        SUM(o.iva_monto) as iva,
        SUM(o.propina) as propinas,
        SUM(o.total) as total_ventas,
        AVG(o.total) as ticket_promedio,
        COUNT(DISTINCT o.id_sesion_mesa) as mesas_atendidas
      FROM ordenes o
      INNER JOIN estados_orden eo ON o.id_estado_orden = eo.id_estado_orden
      WHERE o.fecha_hora_orden >= ${inicio}
        AND o.fecha_hora_orden <= ${fin}
        AND eo.nombre != 'cancelada'
      GROUP BY DATE(o.fecha_hora_orden), TO_CHAR(o.fecha_hora_orden, 'Day')
      ORDER BY fecha
    `;

    return {
      periodo: { inicio, fin },
      agrupacion: 'dia',
      datos: result.map((r) => ({
        fecha: r.fecha,
        dia_semana: r.dia_semana?.trim(),
        total_ordenes: Number(r.total_ordenes),
        subtotal: Number(r.subtotal || 0),
        descuentos: Number(r.descuentos || 0),
        iva: Number(r.iva || 0),
        propinas: Number(r.propinas || 0),
        total_ventas: Number(r.total_ventas || 0),
        ticket_promedio: Number(r.ticket_promedio || 0),
        mesas_atendidas: Number(r.mesas_atendidas),
      })),
    };
  }

  /**
   * Ventas agrupadas por semana
   */
  private async getVentasPorSemana(inicio: Date, fin: Date, where: any) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        EXTRACT(YEAR FROM o.fecha_hora_orden) as anio,
        EXTRACT(WEEK FROM o.fecha_hora_orden) as semana,
        MIN(DATE(o.fecha_hora_orden)) as fecha_inicio,
        MAX(DATE(o.fecha_hora_orden)) as fecha_fin,
        COUNT(DISTINCT o.id_orden) as total_ordenes,
        SUM(o.total) as total_ventas,
        AVG(o.total) as ticket_promedio
      FROM ordenes o
      INNER JOIN estados_orden eo ON o.id_estado_orden = eo.id_estado_orden
      WHERE o.fecha_hora_orden >= ${inicio}
        AND o.fecha_hora_orden <= ${fin}
        AND eo.nombre != 'cancelada'
      GROUP BY EXTRACT(YEAR FROM o.fecha_hora_orden), EXTRACT(WEEK FROM o.fecha_hora_orden)
      ORDER BY anio, semana
    `;

    return {
      periodo: { inicio, fin },
      agrupacion: 'semana',
      datos: result.map((r) => ({
        anio: Number(r.anio),
        semana: Number(r.semana),
        fecha_inicio: r.fecha_inicio,
        fecha_fin: r.fecha_fin,
        total_ordenes: Number(r.total_ordenes),
        total_ventas: Number(r.total_ventas || 0),
        ticket_promedio: Number(r.ticket_promedio || 0),
      })),
    };
  }

  /**
   * Ventas agrupadas por mes
   */
  private async getVentasPorMes(inicio: Date, fin: Date, where: any) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        EXTRACT(YEAR FROM o.fecha_hora_orden) as anio,
        EXTRACT(MONTH FROM o.fecha_hora_orden) as mes,
        TO_CHAR(o.fecha_hora_orden, 'Month') as nombre_mes,
        COUNT(DISTINCT o.id_orden) as total_ordenes,
        SUM(o.subtotal) as subtotal,
        SUM(o.descuento_monto) as descuentos,
        SUM(o.total) as total_ventas,
        AVG(o.total) as ticket_promedio,
        COUNT(DISTINCT DATE(o.fecha_hora_orden)) as dias_operados
      FROM ordenes o
      INNER JOIN estados_orden eo ON o.id_estado_orden = eo.id_estado_orden
      WHERE o.fecha_hora_orden >= ${inicio}
        AND o.fecha_hora_orden <= ${fin}
        AND eo.nombre != 'cancelada'
      GROUP BY EXTRACT(YEAR FROM o.fecha_hora_orden), 
               EXTRACT(MONTH FROM o.fecha_hora_orden),
               TO_CHAR(o.fecha_hora_orden, 'Month')
      ORDER BY anio, mes
    `;

    return {
      periodo: { inicio, fin },
      agrupacion: 'mes',
      datos: result.map((r) => ({
        anio: Number(r.anio),
        mes: Number(r.mes),
        nombre_mes: r.nombre_mes?.trim(),
        total_ordenes: Number(r.total_ordenes),
        subtotal: Number(r.subtotal || 0),
        descuentos: Number(r.descuentos || 0),
        total_ventas: Number(r.total_ventas || 0),
        ticket_promedio: Number(r.ticket_promedio || 0),
        dias_operados: Number(r.dias_operados),
        promedio_diario: Number(r.total_ventas || 0) / Number(r.dias_operados),
      })),
    };
  }

  /**
   * Ventas agrupadas por categoría
   */
  private async getVentasPorCategoria(inicio: Date, fin: Date, where: any) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        c.id_categoria,
        c.nombre as categoria,
        COUNT(DISTINCT od.id_detalle) as items_vendidos,
        SUM(od.cantidad) as cantidad_total,
        SUM(od.subtotal) as subtotal,
        SUM(od.total) as total_ventas,
        AVG(od.precio_unitario) as precio_promedio
      FROM orden_detalle od
      INNER JOIN ordenes o ON od.id_orden = o.id_orden
      INNER JOIN productos p ON od.id_producto = p.id_producto
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      INNER JOIN estados_orden eo ON o.id_estado_orden = eo.id_estado_orden
      WHERE o.fecha_hora_orden >= ${inicio}
        AND o.fecha_hora_orden <= ${fin}
        AND eo.nombre != 'cancelada'
        AND od.estado != 'cancelado'
      GROUP BY c.id_categoria, c.nombre
      ORDER BY total_ventas DESC
    `;

    const totalVentas = result.reduce(
      (sum, r) => sum + Number(r.total_ventas || 0),
      0,
    );

    return {
      periodo: { inicio, fin },
      agrupacion: 'categoria',
      total_ventas: totalVentas,
      datos: result.map((r) => ({
        id_categoria: Number(r.id_categoria),
        categoria: r.categoria,
        items_vendidos: Number(r.items_vendidos),
        cantidad_total: Number(r.cantidad_total || 0),
        subtotal: Number(r.subtotal || 0),
        total_ventas: Number(r.total_ventas || 0),
        precio_promedio: Number(r.precio_promedio || 0),
        porcentaje_ventas:
          totalVentas > 0
            ? ((Number(r.total_ventas || 0) / totalVentas) * 100).toFixed(2)
            : '0.00',
      })),
    };
  }

  /**
   * Ventas agrupadas por mesero
   */
  private async getVentasPorMesero(inicio: Date, fin: Date, where: any) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        u.id_usuario,
        u.username,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as nombre_completo,
        COUNT(DISTINCT o.id_orden) as total_ordenes,
        SUM(o.subtotal) as subtotal,
        SUM(o.total) as total_ventas,
        SUM(o.propina) as total_propinas,
        AVG(o.total) as ticket_promedio,
        COUNT(DISTINCT o.id_sesion_mesa) as mesas_atendidas
      FROM ordenes o
      INNER JOIN usuarios u ON o.id_usuario_mesero = u.id_usuario
      INNER JOIN personas p ON u.id_persona = p.id_persona
      INNER JOIN estados_orden eo ON o.id_estado_orden = eo.id_estado_orden
      WHERE o.fecha_hora_orden >= ${inicio}
        AND o.fecha_hora_orden <= ${fin}
        AND eo.nombre != 'cancelada'
      GROUP BY u.id_usuario, u.username, p.nombre, p.apellido_paterno
      ORDER BY total_ventas DESC
    `;

    return {
      periodo: { inicio, fin },
      agrupacion: 'mesero',
      datos: result.map((r) => ({
        id_usuario: Number(r.id_usuario),
        username: r.username,
        nombre_completo: r.nombre_completo,
        total_ordenes: Number(r.total_ordenes),
        subtotal: Number(r.subtotal || 0),
        total_ventas: Number(r.total_ventas || 0),
        total_propinas: Number(r.total_propinas || 0),
        ticket_promedio: Number(r.ticket_promedio || 0),
        mesas_atendidas: Number(r.mesas_atendidas),
        propina_promedio:
          Number(r.total_ordenes) > 0
            ? Number(r.total_propinas || 0) / Number(r.total_ordenes)
            : 0,
      })),
    };
  }

  /**
   * Resumen general de ventas
   */
  private async getVentasResumen(inicio: Date, fin: Date, where: any) {
    const ordenes = await this.prisma.ordenes.findMany({
      where,
      include: {
        estados_orden: true,
        orden_detalle: true,
      },
    });

    const totalOrdenes = ordenes.length;
    const totalVentas = ordenes.reduce(
      (sum, o) => sum + Number(o.total || 0),
      0,
    );
    const totalSubtotal = ordenes.reduce(
      (sum, o) => sum + Number(o.subtotal || 0),
      0,
    );
    const totalDescuentos = ordenes.reduce(
      (sum, o) => sum + Number(o.descuento_monto || 0),
      0,
    );
    const totalIva = ordenes.reduce(
      (sum, o) => sum + Number(o.iva_monto || 0),
      0,
    );
    const totalPropinas = ordenes.reduce(
      (sum, o) => sum + Number(o.propina || 0),
      0,
    );
    const totalItems = ordenes.reduce(
      (sum, o) =>
        sum + o.orden_detalle.reduce((s, d) => s + Number(d.cantidad || 0), 0),
      0,
    );

    return {
      periodo: { inicio, fin },
      resumen: {
        total_ordenes: totalOrdenes,
        total_ventas: totalVentas,
        total_subtotal: totalSubtotal,
        total_descuentos: totalDescuentos,
        total_iva: totalIva,
        total_propinas: totalPropinas,
        ticket_promedio: totalOrdenes > 0 ? totalVentas / totalOrdenes : 0,
        items_promedio_orden: totalOrdenes > 0 ? totalItems / totalOrdenes : 0,
        porcentaje_descuento:
          totalSubtotal > 0 ? (totalDescuentos / totalSubtotal) * 100 : 0,
      },
    };
  }

  // ==================== PRODUCTOS ====================

  /**
   * Top productos más vendidos
   */
  async getProductosTop(query: QueryProductosTopDto) {
    const limit = query.limit || 10;
    const fechaInicio = query.fecha_inicio
      ? new Date(query.fecha_inicio)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const fechaFin = query.fecha_fin ? new Date(query.fecha_fin) : new Date();

    const categoriaFilter = query.id_categoria
      ? Prisma.sql`AND p.id_categoria = ${query.id_categoria}`
      : Prisma.empty;

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        p.id_producto,
        p.sku,
        p.nombre,
        p.precio_venta,
        p.costo_promedio,
        c.nombre as categoria,
        COUNT(DISTINCT od.id_detalle) as veces_vendido,
        SUM(od.cantidad) as cantidad_total,
        SUM(od.subtotal) as subtotal,
        SUM(od.total) as ingresos_totales,
        AVG(od.precio_unitario) as precio_promedio,
        SUM(od.total - (od.cantidad * COALESCE(p.costo_promedio, 0))) as utilidad_bruta
      FROM productos p
      INNER JOIN orden_detalle od ON p.id_producto = od.id_producto
      INNER JOIN ordenes o ON od.id_orden = o.id_orden
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE od.estado = 'servido'
        AND o.fecha_hora_orden >= ${fechaInicio}
        AND o.fecha_hora_orden <= ${fechaFin}
        ${categoriaFilter}
      GROUP BY p.id_producto, p.sku, p.nombre, p.precio_venta, p.costo_promedio, c.nombre
      ORDER BY cantidad_total DESC
      LIMIT ${limit}
    `;

    return {
      periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      productos: result.map((r) => ({
        id_producto: Number(r.id_producto),
        sku: r.sku,
        nombre: r.nombre,
        categoria: r.categoria,
        precio_venta: Number(r.precio_venta || 0),
        costo_promedio: Number(r.costo_promedio || 0),
        veces_vendido: Number(r.veces_vendido),
        cantidad_total: Number(r.cantidad_total || 0),
        subtotal: Number(r.subtotal || 0),
        ingresos_totales: Number(r.ingresos_totales || 0),
        precio_promedio: Number(r.precio_promedio || 0),
        utilidad_bruta: Number(r.utilidad_bruta || 0),
        margen_porcentaje:
          Number(r.ingresos_totales || 0) > 0
            ? (
                (Number(r.utilidad_bruta || 0) /
                  Number(r.ingresos_totales || 0)) *
                100
              ).toFixed(2)
            : '0.00',
      })),
    };
  }

  /**
   * Productos con peor desempeño
   */
  async getProductosBottom(query: QueryProductosTopDto) {
    const limit = query.limit || 10;
    const fechaInicio = query.fecha_inicio
      ? new Date(query.fecha_inicio)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const fechaFin = query.fecha_fin ? new Date(query.fecha_fin) : new Date();

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        p.id_producto,
        p.sku,
        p.nombre,
        p.precio_venta,
        c.nombre as categoria,
        COUNT(DISTINCT od.id_detalle) as veces_vendido,
        SUM(od.cantidad) as cantidad_total,
        SUM(od.total) as ingresos_totales
      FROM productos p
      INNER JOIN orden_detalle od ON p.id_producto = od.id_producto
      INNER JOIN ordenes o ON od.id_orden = o.id_orden
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE od.estado = 'servido'
        AND o.fecha_hora_orden >= ${fechaInicio}
        AND o.fecha_hora_orden <= ${fechaFin}
        AND p.es_vendible = TRUE
        AND p.disponible = TRUE
      GROUP BY p.id_producto, p.sku, p.nombre, p.precio_venta, c.nombre
      ORDER BY cantidad_total ASC
      LIMIT ${limit}
    `;

    return {
      periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      productos: result.map((r) => ({
        id_producto: Number(r.id_producto),
        sku: r.sku,
        nombre: r.nombre,
        categoria: r.categoria,
        precio_venta: Number(r.precio_venta || 0),
        veces_vendido: Number(r.veces_vendido),
        cantidad_total: Number(r.cantidad_total || 0),
        ingresos_totales: Number(r.ingresos_totales || 0),
        recomendacion: this.getRecomendacionProductoBajo(
          Number(r.cantidad_total || 0),
        ),
      })),
    };
  }

  // ==================== ANÁLISIS POR MESERO ====================

  /**
   * Análisis detallado de rendimiento por mesero
   */
  async getAnalisisMesero(query: QueryAnalisisMeseroDto) {
    const fechaInicio = query.fecha_inicio
      ? new Date(query.fecha_inicio)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const fechaFin = query.fecha_fin ? new Date(query.fecha_fin) : new Date();

    const meseroFilter = query.id_mesero
      ? Prisma.sql`AND u.id_usuario = ${query.id_mesero}`
      : Prisma.empty;

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        u.id_usuario,
        u.username,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as nombre_completo,
        r.nombre as rol,
        COUNT(DISTINCT o.id_orden) as total_ordenes,
        COUNT(DISTINCT o.id_sesion_mesa) as mesas_atendidas,
        SUM(o.total) as total_ventas,
        SUM(o.propina) as total_propinas,
        AVG(o.total) as ticket_promedio,
        AVG(EXTRACT(EPOCH FROM (o.fecha_hora_servido - o.fecha_hora_orden))/60) as tiempo_promedio_servicio,
        COUNT(DISTINCT DATE(o.fecha_hora_orden)) as dias_trabajados
      FROM ordenes o
      INNER JOIN usuarios u ON o.id_usuario_mesero = u.id_usuario
      INNER JOIN personas p ON u.id_persona = p.id_persona
      INNER JOIN roles r ON u.id_rol = r.id_rol
      INNER JOIN estados_orden eo ON o.id_estado_orden = eo.id_estado_orden
      WHERE o.fecha_hora_orden >= ${fechaInicio}
        AND o.fecha_hora_orden <= ${fechaFin}
        AND eo.nombre = 'pagada'
        ${meseroFilter}
      GROUP BY u.id_usuario, u.username, p.nombre, p.apellido_paterno, r.nombre
      ORDER BY total_ventas DESC
    `;

    return {
      periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      meseros: result.map((r) => {
        const totalVentas = Number(r.total_ventas || 0);
        const totalPropinas = Number(r.total_propinas || 0);
        const totalOrdenes = Number(r.total_ordenes);
        const diasTrabajados = Number(r.dias_trabajados);

        return {
          id_usuario: Number(r.id_usuario),
          username: r.username,
          nombre_completo: r.nombre_completo,
          rol: r.rol,
          total_ordenes: totalOrdenes,
          mesas_atendidas: Number(r.mesas_atendidas),
          total_ventas: totalVentas,
          total_propinas: totalPropinas,
          ticket_promedio: Number(r.ticket_promedio || 0),
          tiempo_promedio_servicio: Number(r.tiempo_promedio_servicio || 0),
          dias_trabajados: diasTrabajados,
          ventas_promedio_dia:
            diasTrabajados > 0 ? totalVentas / diasTrabajados : 0,
          propina_promedio_orden:
            totalOrdenes > 0 ? totalPropinas / totalOrdenes : 0,
          porcentaje_propina:
            totalVentas > 0
              ? ((totalPropinas / totalVentas) * 100).toFixed(2)
              : '0.00',
          eficiencia: this.calcularEficienciaMesero({
            ordenes: totalOrdenes,
            dias: diasTrabajados,
            tiempo_servicio: Number(r.tiempo_promedio_servicio || 0),
          }),
        };
      }),
    };
  }

  // ==================== HORAS PICO ====================

  /**
   * Análisis de horas pico de operación
   */
  async getHorasPico(query: QueryHorasPicoDto) {
    const fechaInicio = query.fecha_inicio
      ? new Date(query.fecha_inicio)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const fechaFin = query.fecha_fin ? new Date(query.fecha_fin) : new Date();

    const diaFilter =
      query.dia_semana !== undefined
        ? Prisma.sql`AND EXTRACT(DOW FROM o.fecha_hora_orden) = ${query.dia_semana}`
        : Prisma.empty;

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        EXTRACT(HOUR FROM o.fecha_hora_orden) as hora,
        EXTRACT(DOW FROM o.fecha_hora_orden) as dia_semana,
        TO_CHAR(o.fecha_hora_orden, 'Day') as nombre_dia,
        COUNT(DISTINCT o.id_orden) as total_ordenes,
        COUNT(DISTINCT o.id_sesion_mesa) as mesas_ocupadas,
        SUM(o.total) as total_ventas,
        AVG(o.total) as ticket_promedio
      FROM ordenes o
      INNER JOIN estados_orden eo ON o.id_estado_orden = eo.id_estado_orden
      WHERE o.fecha_hora_orden >= ${fechaInicio}
        AND o.fecha_hora_orden <= ${fechaFin}
        AND eo.nombre != 'cancelada'
        ${diaFilter}
      GROUP BY EXTRACT(HOUR FROM o.fecha_hora_orden), 
               EXTRACT(DOW FROM o.fecha_hora_orden),
               TO_CHAR(o.fecha_hora_orden, 'Day')
      ORDER BY total_ventas DESC
    `;

    // Agrupar por hora si no hay filtro de día
    const agrupado =
      query.dia_semana === undefined ? this.agruparPorHora(result) : result;

    return {
      periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      horas_pico: agrupado.map((r: any) => ({
        hora: Number(r.hora),
        dia_semana:
          r.dia_semana !== undefined ? Number(r.dia_semana) : undefined,
        nombre_dia: r.nombre_dia?.trim(),
        total_ordenes: Number(r.total_ordenes),
        mesas_ocupadas: Number(r.mesas_ocupadas),
        total_ventas: Number(r.total_ventas || 0),
        ticket_promedio: Number(r.ticket_promedio || 0),
        clasificacion: this.clasificarHora(Number(r.total_ventas || 0)),
      })),
    };
  }

  // ==================== COMPARATIVOS ====================

  /**
   * Comparativo de ventas entre periodos
   */
  async getComparativo(query: QueryComparativoDto) {
    const periodo = query.periodo || PeriodoComparacion.MES;
    const fechaBase = query.fecha_base
      ? new Date(query.fecha_base)
      : new Date();

    const { actual, anterior } = this.calcularRangosPeriodo(periodo, fechaBase);

    const [ventasActual, ventasAnterior] = await Promise.all([
      this.getVentasPeriodo(actual.inicio, actual.fin),
      this.getVentasPeriodo(anterior.inicio, anterior.fin),
    ]);

    const totalActual = Number(ventasActual._sum.total || 0);
    const totalAnterior = Number(ventasAnterior._sum.total || 0);
    const variacion =
      totalAnterior > 0
        ? ((totalActual - totalAnterior) / totalAnterior) * 100
        : 0;

    // Obtener detalle por día de ambos periodos
    const [detalleActual, detalleAnterior] = await Promise.all([
      this.getVentasPorDia(actual.inicio, actual.fin, {}),
      this.getVentasPorDia(anterior.inicio, anterior.fin, {}),
    ]);

    return {
      periodo_tipo: periodo,
      periodo_actual: {
        inicio: actual.inicio,
        fin: actual.fin,
        total_ventas: totalActual,
        total_ordenes: ventasActual._count,
        ticket_promedio:
          ventasActual._count > 0 ? totalActual / ventasActual._count : 0,
      },
      periodo_anterior: {
        inicio: anterior.inicio,
        fin: anterior.fin,
        total_ventas: totalAnterior,
        total_ordenes: ventasAnterior._count,
        ticket_promedio:
          ventasAnterior._count > 0 ? totalAnterior / ventasAnterior._count : 0,
      },
      comparacion: {
        variacion_ventas_porcentaje: parseFloat(variacion.toFixed(2)),
        variacion_ventas_monto: totalActual - totalAnterior,
        variacion_ordenes: ventasActual._count - ventasAnterior._count,
        tendencia:
          variacion > 0
            ? 'crecimiento'
            : variacion < 0
              ? 'decrecimiento'
              : 'estable',
        interpretacion: this.interpretarVariacion(variacion),
      },
      detalle_dias: {
        periodo_actual: detalleActual.datos,
        periodo_anterior: detalleAnterior.datos,
      },
    };
  }

  // ==================== INVENTARIO ====================

  /**
   * Productos con stock bajo o crítico (mejorado)
   */
  async getInventarioCritico() {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        p.id_producto,
        p.sku,
        p.nombre,
        p.precio_venta,
        p.costo_promedio,
        c.nombre as categoria,
        i.stock_actual,
        i.stock_minimo,
        i.punto_reorden,
        i.stock_maximo,
        um.abreviatura as unidad,
        i.fecha_ultima_compra,
        CASE 
          WHEN i.stock_actual <= 0 THEN 'SIN_STOCK'
          WHEN i.stock_actual < i.stock_minimo THEN 'CRITICO'
          WHEN i.stock_actual < i.punto_reorden THEN 'REORDEN'
          ELSE 'OK'
        END as estado_stock,
        -- Calcular días de inventario basado en consumo promedio
        CASE 
          WHEN (
            SELECT AVG(od.cantidad)
            FROM orden_detalle od
            INNER JOIN ordenes o ON od.id_orden = o.id_orden
            WHERE od.id_producto = p.id_producto
              AND o.fecha_hora_orden >= CURRENT_DATE - INTERVAL '30 days'
              AND od.estado = 'servido'
          ) > 0 THEN 
            i.stock_actual / (
              SELECT AVG(od.cantidad)
              FROM orden_detalle od
              INNER JOIN ordenes o ON od.id_orden = o.id_orden
              WHERE od.id_producto = p.id_producto
                AND o.fecha_hora_orden >= CURRENT_DATE - INTERVAL '30 days'
                AND od.estado = 'servido'
            )
          ELSE NULL
        END as dias_inventario_estimados
      FROM inventario i
      INNER JOIN productos p ON i.id_producto = p.id_producto
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      INNER JOIN unidades_medida um ON p.id_unidad_medida = um.id_unidad
      WHERE p.es_inventariable = TRUE
        AND p.disponible = TRUE
        AND (i.stock_actual <= i.stock_minimo OR i.stock_actual <= i.punto_reorden)
      ORDER BY 
        CASE 
          WHEN i.stock_actual <= 0 THEN 1
          WHEN i.stock_actual < i.stock_minimo THEN 2
          WHEN i.stock_actual < i.punto_reorden THEN 3
          ELSE 4
        END,
        i.stock_actual ASC
    `;

    return {
      total_productos_criticos: result.length,
      sin_stock: result.filter((r) => r.estado_stock === 'SIN_STOCK').length,
      criticos: result.filter((r) => r.estado_stock === 'CRITICO').length,
      por_reordenar: result.filter((r) => r.estado_stock === 'REORDEN').length,
      productos: result.map((r) => ({
        id_producto: Number(r.id_producto),
        sku: r.sku,
        nombre: r.nombre,
        categoria: r.categoria,
        stock_actual: Number(r.stock_actual || 0),
        stock_minimo: Number(r.stock_minimo || 0),
        punto_reorden: Number(r.punto_reorden || 0),
        stock_maximo: Number(r.stock_maximo || 0),
        unidad: r.unidad,
        estado_stock: r.estado_stock,
        dias_inventario_estimados: r.dias_inventario_estimados
          ? Number(r.dias_inventario_estimados).toFixed(1)
          : null,
        fecha_ultima_compra: r.fecha_ultima_compra,
        prioridad: this.calcularPrioridadReorden(r),
        costo_reposicion:
          Number(r.costo_promedio || 0) *
          (Number(r.stock_maximo || 0) - Number(r.stock_actual || 0)),
      })),
    };
  }

  /**
   * Sugerencias de compra mejoradas
   */
  async getSugerenciasCompra(query: SugerenciasCompraDto) {
    const diasAnalisis = query.dias_analisis || 30;
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - diasAnalisis);

    const result = await this.prisma.$queryRaw<any[]>`
      WITH consumo_promedio AS (
        SELECT 
          p.id_producto,
          p.nombre,
          p.sku,
          p.costo_promedio,
          c.nombre as categoria,
          i.stock_actual,
          i.punto_reorden,
          i.stock_maximo,
          i.stock_minimo,
          um.abreviatura as unidad,
          COUNT(DISTINCT DATE(o.fecha_hora_orden)) as dias_con_ventas,
          COALESCE(SUM(od.cantidad), 0) as total_vendido,
          COALESCE(SUM(od.cantidad) / NULLIF(COUNT(DISTINCT DATE(o.fecha_hora_orden)), 0), 0) as consumo_diario_promedio
        FROM productos p
        INNER JOIN inventario i ON p.id_producto = i.id_producto
        INNER JOIN categorias c ON p.id_categoria = c.id_categoria
        INNER JOIN unidades_medida um ON p.id_unidad_medida = um.id_unidad
        LEFT JOIN orden_detalle od ON p.id_producto = od.id_producto
        LEFT JOIN ordenes o ON od.id_orden = o.id_orden 
          AND o.fecha_hora_orden >= ${fechaInicio}
          AND od.estado = 'servido'
        WHERE p.es_inventariable = TRUE
          AND p.disponible = TRUE
        GROUP BY p.id_producto, p.nombre, p.sku, p.costo_promedio, c.nombre,
                 i.stock_actual, i.punto_reorden, i.stock_maximo, i.stock_minimo, um.abreviatura
      ),
      analisis_compra AS (
        SELECT 
          *,
          CASE 
            WHEN consumo_diario_promedio > 0 THEN 
              stock_actual / consumo_diario_promedio
            ELSE 999
          END as dias_inventario_disponible,
          GREATEST(0, stock_maximo - stock_actual) as cantidad_max_comprar,
          CASE 
            WHEN consumo_diario_promedio > 0 THEN
              GREATEST(0, (consumo_diario_promedio * 7) - stock_actual)
            ELSE 0
          END as cantidad_sugerida_semanal,
          CASE
            WHEN stock_actual <= 0 THEN 'URGENTE'
            WHEN stock_actual <= punto_reorden THEN 'URGENTE'
            WHEN stock_actual <= (punto_reorden * 1.5) THEN 'PRONTO'
            WHEN stock_actual < stock_maximo THEN 'NORMAL'
            ELSE 'NO_NECESARIO'
          END as prioridad
        FROM consumo_promedio
      )
      SELECT 
        id_producto,
        nombre,
        sku,
        categoria,
        stock_actual,
        stock_minimo,
        punto_reorden,
        stock_maximo,
        unidad,
        dias_con_ventas,
        total_vendido,
        consumo_diario_promedio,
        dias_inventario_disponible,
        cantidad_max_comprar,
        cantidad_sugerida_semanal,
        GREATEST(cantidad_sugerida_semanal, stock_minimo - stock_actual) as cantidad_recomendada,
        costo_promedio,
        prioridad
      FROM analisis_compra
      WHERE prioridad != 'NO_NECESARIO'
        AND (stock_actual < stock_maximo OR stock_actual <= punto_reorden)
      ORDER BY 
        CASE prioridad
          WHEN 'URGENTE' THEN 1
          WHEN 'PRONTO' THEN 2
          WHEN 'NORMAL' THEN 3
          ELSE 4
        END,
        dias_inventario_disponible ASC
    `;

    // Filtrar por prioridad si se especifica
    const productosFiltrados = query.prioridad
      ? result.filter((r) => r.prioridad === query.prioridad)
      : result;

    const totalCostoEstimado = productosFiltrados.reduce(
      (sum, r) =>
        sum +
        Number(r.cantidad_recomendada || 0) * Number(r.costo_promedio || 0),
      0,
    );

    return {
      fecha_analisis: new Date(),
      dias_analizados: diasAnalisis,
      total_productos: productosFiltrados.length,
      urgentes: productosFiltrados.filter((r) => r.prioridad === 'URGENTE')
        .length,
      costo_total_estimado: totalCostoEstimado,
      productos: productosFiltrados.map((r) => ({
        id_producto: Number(r.id_producto),
        sku: r.sku,
        nombre: r.nombre,
        categoria: r.categoria,
        stock_actual: Number(r.stock_actual || 0),
        stock_minimo: Number(r.stock_minimo || 0),
        punto_reorden: Number(r.punto_reorden || 0),
        stock_maximo: Number(r.stock_maximo || 0),
        unidad: r.unidad,
        consumo_diario_promedio: Number(r.consumo_diario_promedio || 0).toFixed(
          2,
        ),
        dias_inventario_disponible: Number(
          r.dias_inventario_disponible || 0,
        ).toFixed(1),
        cantidad_recomendada: Number(r.cantidad_recomendada || 0),
        costo_unitario: Number(r.costo_promedio || 0),
        costo_total:
          Number(r.cantidad_recomendada || 0) * Number(r.costo_promedio || 0),
        prioridad: r.prioridad,
        dias_con_ventas: Number(r.dias_con_ventas),
        total_vendido_periodo: Number(r.total_vendido || 0),
      })),
    };
  }

  /**
   * Proyección de cuándo se agotará el inventario
   */
  async getProyeccionInventario(idProducto?: number) {
    const productoFilter = idProducto
      ? Prisma.sql`AND p.id_producto = ${idProducto}`
      : Prisma.empty;

    const result = await this.prisma.$queryRaw<any[]>`
      WITH consumo_reciente AS (
        SELECT 
          p.id_producto,
          p.nombre,
          p.sku,
          i.stock_actual,
          um.abreviatura as unidad,
          COUNT(DISTINCT DATE(o.fecha_hora_orden)) as dias_con_ventas,
          COALESCE(SUM(od.cantidad), 0) as total_vendido,
          COALESCE(
            SUM(od.cantidad) / NULLIF(COUNT(DISTINCT DATE(o.fecha_hora_orden)), 0),
            0
          ) as consumo_diario_promedio
        FROM productos p
        INNER JOIN inventario i ON p.id_producto = i.id_producto
        INNER JOIN unidades_medida um ON p.id_unidad_medida = um.id_unidad
        LEFT JOIN orden_detalle od ON p.id_producto = od.id_producto
        LEFT JOIN ordenes o ON od.id_orden = o.id_orden 
          AND o.fecha_hora_orden >= CURRENT_DATE - INTERVAL '30 days'
          AND od.estado = 'servido'
        WHERE p.es_inventariable = TRUE
          AND p.disponible = TRUE
          ${productoFilter}
        GROUP BY p.id_producto, p.nombre, p.sku, i.stock_actual, um.abreviatura
      )
      SELECT 
        id_producto,
        nombre,
        sku,
        stock_actual,
        unidad,
        consumo_diario_promedio,
        CASE 
          WHEN consumo_diario_promedio > 0 THEN 
            stock_actual / consumo_diario_promedio
          ELSE NULL
        END as dias_hasta_agotarse,
        CASE 
          WHEN consumo_diario_promedio > 0 THEN 
            CURRENT_DATE + (stock_actual / consumo_diario_promedio || ' days')::INTERVAL
          ELSE NULL
        END as fecha_estimada_agotamiento
      FROM consumo_reciente
      WHERE consumo_diario_promedio > 0
        AND stock_actual > 0
      ORDER BY dias_hasta_agotarse ASC
    `;

    return {
      fecha_analisis: new Date(),
      productos: result.map((r) => ({
        id_producto: Number(r.id_producto),
        sku: r.sku,
        nombre: r.nombre,
        stock_actual: Number(r.stock_actual || 0),
        unidad: r.unidad,
        consumo_diario_promedio: Number(r.consumo_diario_promedio || 0).toFixed(
          2,
        ),
        dias_hasta_agotarse: r.dias_hasta_agotarse
          ? Number(r.dias_hasta_agotarse).toFixed(1)
          : null,
        fecha_estimada_agotamiento: r.fecha_estimada_agotamiento,
        alerta:
          Number(r.dias_hasta_agotarse || 999) < 7
            ? 'Se agota en menos de 1 semana'
            : Number(r.dias_hasta_agotarse || 999) < 14
              ? 'Se agota en menos de 2 semanas'
              : 'Inventario suficiente',
      })),
    };
  }

  // ==================== ANÁLISIS DE RENTABILIDAD ====================

  /**
   * Análisis de rentabilidad por producto
   */
  async getAnalisisRentabilidad(query: QueryProductosTopDto) {
    const fechaInicio = query.fecha_inicio
      ? new Date(query.fecha_inicio)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const fechaFin = query.fecha_fin ? new Date(query.fecha_fin) : new Date();

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        p.id_producto,
        p.sku,
        p.nombre,
        p.precio_venta,
        p.costo_promedio,
        c.nombre as categoria,
        SUM(od.cantidad) as cantidad_vendida,
        SUM(od.total) as ingresos_totales,
        SUM(od.cantidad * COALESCE(p.costo_promedio, 0)) as costo_total,
        SUM(od.total - (od.cantidad * COALESCE(p.costo_promedio, 0))) as utilidad_bruta,
        AVG(od.precio_unitario) as precio_promedio_venta
      FROM productos p
      INNER JOIN orden_detalle od ON p.id_producto = od.id_producto
      INNER JOIN ordenes o ON od.id_orden = o.id_orden
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      WHERE od.estado = 'servido'
        AND o.fecha_hora_orden >= ${fechaInicio}
        AND o.fecha_hora_orden <= ${fechaFin}
      GROUP BY p.id_producto, p.sku, p.nombre, p.precio_venta, p.costo_promedio, c.nombre
      HAVING SUM(od.cantidad) > 0
      ORDER BY utilidad_bruta DESC
    `;

    return {
      periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      resumen: {
        total_productos: result.length,
        ingresos_totales: result.reduce(
          (sum, r) => sum + Number(r.ingresos_totales || 0),
          0,
        ),
        costos_totales: result.reduce(
          (sum, r) => sum + Number(r.costo_total || 0),
          0,
        ),
        utilidad_bruta_total: result.reduce(
          (sum, r) => sum + Number(r.utilidad_bruta || 0),
          0,
        ),
      },
      productos: result.map((r) => {
        const ingresos = Number(r.ingresos_totales || 0);
        const costos = Number(r.costo_total || 0);
        const utilidad = Number(r.utilidad_bruta || 0);
        const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;

        return {
          id_producto: Number(r.id_producto),
          sku: r.sku,
          nombre: r.nombre,
          categoria: r.categoria,
          precio_venta: Number(r.precio_venta || 0),
          costo_promedio: Number(r.costo_promedio || 0),
          cantidad_vendida: Number(r.cantidad_vendida || 0),
          ingresos_totales: ingresos,
          costo_total: costos,
          utilidad_bruta: utilidad,
          margen_porcentaje: margen.toFixed(2),
          clasificacion: this.clasificarRentabilidad(margen),
          roi: costos > 0 ? ((utilidad / costos) * 100).toFixed(2) : 'N/A',
        };
      }),
    };
  }

  // ==================== TENDENCIAS ====================

  /**
   * Análisis de tendencias por día de la semana
   */
  async getTendenciasDiaSemana(query: QueryReportesBaseDto) {
    const fechaInicio = query.fecha_inicio
      ? new Date(query.fecha_inicio)
      : new Date(new Date().setDate(new Date().getDate() - 90)); // 3 meses
    const fechaFin = query.fecha_fin ? new Date(query.fecha_fin) : new Date();

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        EXTRACT(DOW FROM o.fecha_hora_orden) as dia_semana_num,
        TO_CHAR(o.fecha_hora_orden, 'Day') as dia_semana,
        COUNT(DISTINCT DATE(o.fecha_hora_orden)) as total_dias,
        COUNT(DISTINCT o.id_orden) as total_ordenes,
        SUM(o.total) as total_ventas,
        AVG(o.total) as ticket_promedio,
        COUNT(DISTINCT o.id_sesion_mesa) as mesas_atendidas
      FROM ordenes o
      INNER JOIN estados_orden eo ON o.id_estado_orden = eo.id_estado_orden
      WHERE o.fecha_hora_orden >= ${fechaInicio}
        AND o.fecha_hora_orden <= ${fechaFin}
        AND eo.nombre != 'cancelada'
      GROUP BY EXTRACT(DOW FROM o.fecha_hora_orden), TO_CHAR(o.fecha_hora_orden, 'Day')
      ORDER BY dia_semana_num
    `;

    return {
      periodo: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
      dias: result.map((r) => {
        const totalDias = Number(r.total_dias);
        const totalVentas = Number(r.total_ventas || 0);
        const totalOrdenes = Number(r.total_ordenes);

        return {
          dia_semana_num: Number(r.dia_semana_num),
          dia_semana: r.dia_semana?.trim(),
          total_dias_analizados: totalDias,
          total_ordenes: totalOrdenes,
          total_ventas: totalVentas,
          ticket_promedio: Number(r.ticket_promedio || 0),
          mesas_atendidas: Number(r.mesas_atendidas),
          promedio_ventas_dia: totalDias > 0 ? totalVentas / totalDias : 0,
          promedio_ordenes_dia: totalDias > 0 ? totalOrdenes / totalDias : 0,
          clasificacion: this.clasificarDiaSemana(totalVentas / totalDias),
        };
      }),
    };
  }

  // ==================== ESTADO DE MESAS ====================

  /**
   * Estado actual de mesas (mejorado)
   */
  async getEstadoMesas() {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        m.id_mesa,
        m.numero_mesa,
        m.capacidad_personas,
        m.ubicacion,
        m.planta,
        em.nombre as estado,
        em.color_hex,
        sm.id_sesion,
        sm.numero_comensales,
        sm.nombre_cliente,
        sm.fecha_hora_apertura,
        u.username as mesero_asignado,
        CONCAT(p.nombre, ' ', p.apellido_paterno) as nombre_mesero,
        COALESCE((
          SELECT SUM(o.total)
          FROM ordenes o
          WHERE o.id_sesion_mesa = sm.id_sesion
        ), 0) as consumo_actual,
        COALESCE((
          SELECT COUNT(*)
          FROM ordenes o
          WHERE o.id_sesion_mesa = sm.id_sesion
        ), 0) as ordenes_activas,
        EXTRACT(EPOCH FROM (NOW() - sm.fecha_hora_apertura))/60 as minutos_ocupada
      FROM mesas m
      LEFT JOIN estados_mesa em ON m.id_estado_mesa = em.id_estado_mesa
      LEFT JOIN sesiones_mesa sm ON m.id_mesa = sm.id_mesa AND sm.estado = 'abierta'
      LEFT JOIN usuarios u ON sm.id_usuario_apertura = u.id_usuario
      LEFT JOIN personas p ON u.id_persona = p.id_persona
      WHERE m.activa = TRUE
      ORDER BY m.numero_mesa
    `;

    const totalMesas = result.length;
    const mesasOcupadas = result.filter((r) => r.estado === 'Ocupada').length;
    const mesasDisponibles = result.filter(
      (r) => r.estado === 'Disponible',
    ).length;

    return {
      resumen: {
        total_mesas: totalMesas,
        mesas_ocupadas: mesasOcupadas,
        mesas_disponibles: mesasDisponibles,
        porcentaje_ocupacion:
          totalMesas > 0
            ? ((mesasOcupadas / totalMesas) * 100).toFixed(2)
            : '0.00',
        capacidad_total: result.reduce(
          (sum, r) => sum + Number(r.capacidad_personas || 0),
          0,
        ),
        comensales_actuales: result.reduce(
          (sum, r) => sum + Number(r.numero_comensales || 0),
          0,
        ),
      },
      mesas: result.map((r) => ({
        id_mesa: Number(r.id_mesa),
        numero_mesa: r.numero_mesa,
        capacidad_personas: Number(r.capacidad_personas),
        ubicacion: r.ubicacion,
        planta: Number(r.planta || 1),
        estado: r.estado,
        color_hex: r.color_hex,
        id_sesion: r.id_sesion ? Number(r.id_sesion) : null,
        numero_comensales: r.numero_comensales
          ? Number(r.numero_comensales)
          : null,
        nombre_cliente: r.nombre_cliente,
        fecha_hora_apertura: r.fecha_hora_apertura,
        mesero_asignado: r.mesero_asignado,
        nombre_mesero: r.nombre_mesero,
        consumo_actual: Number(r.consumo_actual || 0),
        ordenes_activas: Number(r.ordenes_activas || 0),
        minutos_ocupada: r.minutos_ocupada
          ? Number(r.minutos_ocupada).toFixed(0)
          : null,
      })),
    };
  }

  // ==================== REFRESH VISTAS MATERIALIZADAS ====================

  /**
   * Refrescar vistas materializadas
   */
  async refreshMaterializedViews() {
    try {
      this.logger.log('Iniciando refresh de vistas materializadas');
      const startTime = Date.now();

      await this.prisma.$executeRaw`
        REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS mv_analisis_ventas
      `;

      const duration = Date.now() - startTime;
      this.logger.log(`Vistas materializadas actualizadas en ${duration}ms`);

      return {
        success: true,
        duration_ms: duration,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Error refrescando vistas materializadas', error);
      throw error;
    }
  }

  // ==================== MÉTODOS AUXILIARES PRIVADOS ====================

  /**
   * Obtener ventas en un periodo
   */
  private async getVentasPeriodo(inicio: Date, fin: Date) {
    return this.prisma.ordenes.aggregate({
      where: {
        fecha_hora_orden: {
          gte: inicio,
          lte: fin,
        },
        estados_orden: {
          nombre: 'pagada',
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
    });
  }

  /**
   * Obtener órdenes del día
   */
  private async getOrdenesDelDia(inicio: Date, fin: Date) {
    return this.prisma.ordenes.aggregate({
      where: {
        fecha_hora_orden: {
          gte: inicio,
          lte: fin,
        },
        estados_orden: {
          nombre: 'pagada',
        },
      },
      _count: true,
    });
  }

  /**
   * Resumen del estado de mesas
   */
  private async getEstadoMesasResumen() {
    const mesas = await this.prisma.mesas.findMany({
      where: { activa: true },
      include: {
        estados_mesa: true,
      },
    });

    return {
      totales: mesas.length,
      ocupadas: mesas.filter((m) => m.estados_mesa?.nombre === 'Ocupada')
        .length,
      disponibles: mesas.filter((m) => m.estados_mesa?.nombre === 'Disponible')
        .length,
    };
  }

  /**
   * Productos con stock crítico
   */
  private async getProductosStockCritico() {
    const inventario = await this.prisma.inventario.findMany({
      where: {
        OR: [
          { stock_actual: { lte: this.prisma.inventario.fields.stock_minimo } },
          { stock_actual: { lte: 0 } },
        ],
      },
      include: {
        productos: true,
      },
    });

    return inventario.filter(
      (i) =>
        Number(i.stock_actual) <= Number(i.stock_minimo) ||
        Number(i.stock_actual) <= 0,
    );
  }

  /**
   * Propinas en un periodo
   */
  private async getPropinasPeriodo(inicio: Date, fin: Date) {
    return this.prisma.ordenes.aggregate({
      where: {
        fecha_hora_orden: {
          gte: inicio,
          lte: fin,
        },
        estados_orden: {
          nombre: 'pagada',
        },
      },
      _sum: {
        propina: true,
      },
    });
  }

  /**
   * Ventas del mes actual
   */
  private async getVentasMesActual() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return this.getVentasPeriodo(inicioMes, hoy);
  }

  /**
   * Ventas del mes anterior
   */
  private async getVentasMesAnterior() {
    const hoy = new Date();
    const inicioMesAnterior = new Date(
      hoy.getFullYear(),
      hoy.getMonth() - 1,
      1,
    );
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    return this.getVentasPeriodo(inicioMesAnterior, finMesAnterior);
  }

  /**
   * Tendencia de últimos 7 días
   */
  private async getTendencia7Dias() {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const result = await this.getVentasPorDia(hace7Dias, hoy, {});
    return result.datos;
  }

  /**
   * Top 5 productos más vendidos
   */
  private async getProductosTopSimple(limit: number) {
    const resultado = await this.getProductosTop({
      limit,
      fecha_inicio: new Date(
        new Date().setDate(new Date().getDate() - 7),
      ).toISOString(),
      fecha_fin: new Date().toISOString(),
    });
    return resultado.productos;
  }

  /**
   * Horas pico del día actual
   */
  private async getHorasPicoHoy() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);

    const result = await this.getVentasPorHora(hoy, finHoy, {});
    return result.datos.slice(0, 5); // Top 5 horas
  }

  /**
   * Calcular rangos de periodos para comparativos
   */
  private calcularRangosPeriodo(periodo: PeriodoComparacion, fechaBase: Date) {
    const actual = {
      inicio: new Date(fechaBase),
      fin: new Date(fechaBase),
    };
    const anterior = {
      inicio: new Date(fechaBase),
      fin: new Date(fechaBase),
    };

    switch (periodo) {
      case PeriodoComparacion.DIA:
        actual.inicio.setHours(0, 0, 0, 0);
        actual.fin.setHours(23, 59, 59, 999);
        anterior.inicio.setDate(anterior.inicio.getDate() - 1);
        anterior.inicio.setHours(0, 0, 0, 0);
        anterior.fin.setDate(anterior.fin.getDate() - 1);
        anterior.fin.setHours(23, 59, 59, 999);
        break;

      case PeriodoComparacion.SEMANA:
        const diaSemana = actual.inicio.getDay();
        actual.inicio.setDate(actual.inicio.getDate() - diaSemana);
        actual.inicio.setHours(0, 0, 0, 0);
        actual.fin.setDate(actual.inicio.getDate() + 6);
        actual.fin.setHours(23, 59, 59, 999);
        anterior.inicio.setDate(actual.inicio.getDate() - 7);
        anterior.fin.setDate(actual.fin.getDate() - 7);
        break;

      case PeriodoComparacion.MES:
        actual.inicio = new Date(
          fechaBase.getFullYear(),
          fechaBase.getMonth(),
          1,
        );
        actual.fin = new Date(
          fechaBase.getFullYear(),
          fechaBase.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        anterior.inicio = new Date(
          fechaBase.getFullYear(),
          fechaBase.getMonth() - 1,
          1,
        );
        anterior.fin = new Date(
          fechaBase.getFullYear(),
          fechaBase.getMonth(),
          0,
          23,
          59,
          59,
          999,
        );
        break;

      case PeriodoComparacion.ANIO:
        actual.inicio = new Date(fechaBase.getFullYear(), 0, 1);
        actual.fin = new Date(fechaBase.getFullYear(), 11, 31, 23, 59, 59, 999);
        anterior.inicio = new Date(fechaBase.getFullYear() - 1, 0, 1);
        anterior.fin = new Date(
          fechaBase.getFullYear() - 1,
          11,
          31,
          23,
          59,
          59,
          999,
        );
        break;
    }

    return { actual, anterior };
  }

  /**
   * Agrupar resultados por hora
   */
  private agruparPorHora(datos: any[]) {
    const agrupado: Record<number, any> = {};

    datos.forEach((item) => {
      const hora = Number(item.hora);
      if (!agrupado[hora]) {
        agrupado[hora] = {
          hora,
          total_ordenes: 0,
          total_ventas: 0,
          mesas_ocupadas: 0,
          count: 0,
        };
      }
      agrupado[hora].total_ordenes += Number(item.total_ordenes || 0);
      agrupado[hora].total_ventas += Number(item.total_ventas || 0);
      agrupado[hora].mesas_ocupadas += Number(item.mesas_ocupadas || 0);
      agrupado[hora].count++;
    });

    return Object.values(agrupado).map((item: any) => ({
      hora: item.hora,
      total_ordenes: item.total_ordenes,
      total_ventas: item.total_ventas,
      ticket_promedio:
        item.total_ordenes > 0 ? item.total_ventas / item.total_ordenes : 0,
      mesas_ocupadas: Math.round(item.mesas_ocupadas / item.count),
    }));
  }

  /**
   * Generar alertas del dashboard
   */
  private generarAlertas(datos: {
    stockCritico: number;
    variacionVsAyer: number;
    mesasOcupadas: number;
    mesasTotales: number;
  }): Array<{ tipo: string; mensaje: string; prioridad: string }> {
    // ✅ FIX: Tipar explícitamente el array
    const alertas: Array<{ tipo: string; mensaje: string; prioridad: string }> =
      [];

    if (datos.stockCritico > 0) {
      alertas.push({
        tipo: 'inventario',
        mensaje: `${datos.stockCritico} productos con stock crítico`,
        prioridad: 'alta',
      });
    }

    if (datos.variacionVsAyer < -20) {
      alertas.push({
        tipo: 'ventas',
        mensaje: `Ventas ${Math.abs(datos.variacionVsAyer).toFixed(1)}% por debajo de ayer`,
        prioridad: 'media',
      });
    }

    const ocupacion = (datos.mesasOcupadas / datos.mesasTotales) * 100;
    if (ocupacion > 90) {
      alertas.push({
        tipo: 'mesas',
        mensaje: 'Ocupación superior al 90%, considere gestión de esperas',
        prioridad: 'media',
      });
    }

    return alertas;
  }

  /**
   * Calcular prioridad de reorden
   */
  private calcularPrioridadReorden(producto: any): string {
    const stock = Number(producto.stock_actual || 0);
    const minimo = Number(producto.stock_minimo || 0);

    if (stock <= 0) return 'CRITICO';
    if (stock <= minimo * 0.5) return 'URGENTE';
    if (stock <= minimo) return 'ALTO';
    return 'NORMAL';
  }

  /**
   * Calcular eficiencia de mesero
   */
  private calcularEficienciaMesero(datos: {
    ordenes: number;
    dias: number;
    tiempo_servicio: number;
  }): string {
    const ordenesPorDia = datos.dias > 0 ? datos.ordenes / datos.dias : 0;
    const tiempoServicio = datos.tiempo_servicio;

    if (ordenesPorDia > 20 && tiempoServicio < 15) return 'EXCELENTE';
    if (ordenesPorDia > 15 && tiempoServicio < 20) return 'BUENA';
    if (ordenesPorDia > 10) return 'ACEPTABLE';
    return 'NECESITA_MEJORAR';
  }

  /**
   * Clasificar hora del día
   */
  private clasificarHora(ventas: number): string {
    if (ventas > 5000) return 'PICO_ALTO';
    if (ventas > 2000) return 'PICO_MEDIO';
    if (ventas > 500) return 'NORMAL';
    return 'BAJO';
  }

  /**
   * Interpretar variación de ventas
   */
  private interpretarVariacion(variacion: number): string {
    if (variacion > 20) return 'Crecimiento significativo';
    if (variacion > 5) return 'Crecimiento moderado';
    if (variacion > -5) return 'Estabilidad';
    if (variacion > -20) return 'Decrecimiento moderado';
    return 'Decrecimiento significativo';
  }

  /**
   * Clasificar rentabilidad
   */
  private clasificarRentabilidad(margen: number): string {
    if (margen >= 60) return 'EXCELENTE';
    if (margen >= 40) return 'BUENA';
    if (margen >= 20) return 'ACEPTABLE';
    if (margen >= 10) return 'BAJA';
    return 'DEFICIENTE';
  }

  /**
   * Clasificar día de la semana
   */
  private clasificarDiaSemana(ventasPromedio: number): string {
    if (ventasPromedio > 8000) return 'DIA_FUERTE';
    if (ventasPromedio > 5000) return 'DIA_NORMAL';
    return 'DIA_DEBIL';
  }

  /**
   * Recomendación para producto con bajo desempeño
   */
  private getRecomendacionProductoBajo(cantidad: number): string {
    if (cantidad === 0) return 'Considerar eliminar del menú';
    if (cantidad < 5) return 'Evaluar viabilidad del producto';
    if (cantidad < 10) return 'Promocionar o ajustar precio';
    return 'Monitorear desempeño';
  }
}
