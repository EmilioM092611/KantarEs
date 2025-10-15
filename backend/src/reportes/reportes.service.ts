/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async ventas(q: any) {
    const where: any = {};
    if (q?.desde || q?.hasta) {
      where.fecha_hora_orden = {};
      if (q.desde) where.fecha_hora_orden.gte = new Date(q.desde);
      if (q.hasta) where.fecha_hora_orden.lte = new Date(q.hasta);
    }
    const ordenes = await this.prisma.ordenes.findMany({
      where,
      include: { orden_detalle: true },
    });

    const totalVentas = ordenes.reduce(
      (acc, o) => acc + Number(o.total ?? 0),
      0,
    );
    const totalItems = ordenes
      .flatMap((o) => o.orden_detalle)
      .reduce((a, d) => a + Number(d.cantidad ?? 0), 0);

    return { totalVentas, totalItems, ordenes: ordenes.length };
  }

  // Productos con stock_actual <= stock_minimo (o <= 0 si no tienen mínimo)
  async bajoStock() {
    const inv = await this.prisma.inventario.findMany({
      include: { productos: true },
    });
    return inv.filter((r) => {
      const actual = Number(r.stock_actual ?? 0);
      const minimo = Number(r.stock_minimo ?? 0);
      return actual <= minimo || actual <= 0;
    });
  }

  async kpis(q: any) {
    const ventas = await this.ventas(q);
    const productos = await this.prisma.productos.count();
    const mesas = await this.prisma.mesas.count();
    return { ventas, productos, mesas };
  }
}
/*
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('reportes') private reportesQueue: Queue,
  ) {}

  async getVentasDia(fecha?: Date) {
    const fechaConsulta = fecha || new Date();
    const inicio = new Date(fechaConsulta);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fechaConsulta);
    fin.setHours(23, 59, 59, 999);

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        DATE(o.fecha_hora_orden) as fecha,
        COUNT(DISTINCT o.id_orden) as total_ordenes,
        COUNT(DISTINCT sm.id_mesa) as mesas_atendidas,
        SUM(o.subtotal) as subtotal,
        SUM(o.descuento_monto) as descuentos,
        SUM(o.iva_monto) as iva,
        SUM(o.total) as total_ventas,
        AVG(o.total) as ticket_promedio
      FROM ordenes o
      INNER JOIN sesiones_mesa sm ON o.id_sesion_mesa = sm.id_sesion
      INNER JOIN estados_orden eo ON o.id_estado_orden = eo.id_estado_orden
      WHERE eo.nombre = 'pagada'
        AND o.fecha_hora_orden >= ${inicio}
        AND o.fecha_hora_orden <= ${fin}
      GROUP BY DATE(o.fecha_hora_orden)
    `;

    return result;
  }

  async getProductosTop(limit = 10, fechaInicio?: Date, fechaFin?: Date) {
    const whereClause = Prisma.sql`WHERE od.estado = 'servido'`;
    const dateFilter = fechaInicio && fechaFin 
      ? Prisma.sql`AND o.fecha_hora_orden BETWEEN ${fechaInicio} AND ${fechaFin}`
      : Prisma.empty;

    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        p.id_producto,
        p.sku,
        p.nombre,
        c.nombre as categoria,
        COUNT(od.id_detalle) as veces_vendido,
        SUM(od.cantidad) as cantidad_total,
        SUM(od.total) as ingresos_totales,
        AVG(od.precio_unitario) as precio_promedio
      FROM productos p
      INNER JOIN orden_detalle od ON p.id_producto = od.id_producto
      INNER JOIN ordenes o ON od.id_orden = o.id_orden
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      ${whereClause}
      ${dateFilter}
      GROUP BY p.id_producto, p.sku, p.nombre, c.nombre
      ORDER BY cantidad_total DESC
      LIMIT ${limit}
    `;

    return result;
  }

  async getEstadoMesas() {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        m.id_mesa,
        m.numero_mesa,
        m.capacidad_personas,
        m.ubicacion,
        em.nombre as estado,
        em.color_hex,
        sm.id_sesion,
        sm.numero_comensales,
        sm.fecha_hora_apertura,
        u.username as mesero_asignado,
        (
          SELECT SUM(o.total)
          FROM ordenes o
          WHERE o.id_sesion_mesa = sm.id_sesion
        ) as consumo_actual
      FROM mesas m
      LEFT JOIN estados_mesa em ON m.id_estado_mesa = em.id_estado_mesa
      LEFT JOIN sesiones_mesa sm ON m.id_mesa = sm.id_mesa AND sm.estado = 'abierta'
      LEFT JOIN usuarios u ON sm.id_usuario_apertura = u.id_usuario
      WHERE m.activa = TRUE
      ORDER BY m.numero_mesa
    `;

    return result;
  }

  async getInventarioCritico() {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        p.id_producto,
        p.sku,
        p.nombre,
        c.nombre as categoria,
        i.stock_actual,
        i.stock_minimo,
        i.punto_reorden,
        um.abreviatura as unidad,
        CASE 
          WHEN i.stock_actual <= 0 THEN 'SIN STOCK'
          WHEN i.stock_actual < i.stock_minimo THEN 'CRÍTICO'
          WHEN i.stock_actual < i.punto_reorden THEN 'REORDEN'
          ELSE 'OK'
        END as estado_stock
      FROM inventario i
      INNER JOIN productos p ON i.id_producto = p.id_producto
      INNER JOIN categorias c ON p.id_categoria = c.id_categoria
      INNER JOIN unidades_medida um ON p.id_unidad_medida = um.id_unidad
      WHERE p.es_inventariable = TRUE
        AND p.disponible = TRUE
        AND (i.stock_actual <= i.stock_minimo OR i.stock_actual <= i.punto_reorden)
      ORDER BY i.stock_actual ASC
    `;

    return result;
  }

  async getSugerenciaCompras(diasAnalisis = 30) {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - diasAnalisis);

    const result = await this.prisma.$queryRaw<any[]>`
      WITH consumo_promedio AS (
        SELECT 
          p.id_producto,
          p.nombre,
          p.sku,
          AVG(od.cantidad) as consumo_diario_promedio,
          i.stock_actual,
          i.punto_reorden,
          i.stock_maximo
        FROM productos p
        INNER JOIN inventario i ON p.id_producto = i.id_producto
        LEFT JOIN orden_detalle od ON p.id_producto = od.id_producto
        LEFT JOIN ordenes o ON od.id_orden = o.id_orden
        WHERE o.fecha_hora_orden >= ${fechaInicio}
          AND od.estado = 'servido'
        GROUP BY p.id_producto, p.nombre, p.sku, i.stock_actual, i.punto_reorden, i.stock_maximo
      )
      SELECT 
        id_producto,
        nombre,
        sku,
        stock_actual,
        punto_reorden,
        stock_maximo,
        consumo_diario_promedio,
        GREATEST(0, stock_maximo - stock_actual) as cantidad_sugerida,
        CASE
          WHEN stock_actual <= punto_reorden THEN 'URGENTE'
          WHEN stock_actual <= (punto_reorden * 1.5) THEN 'PRONTO'
          ELSE 'NORMAL'
        END as prioridad
      FROM consumo_promedio
      WHERE stock_actual < stock_maximo
      ORDER BY 
        CASE
          WHEN stock_actual <= punto_reorden THEN 1
          WHEN stock_actual <= (punto_reorden * 1.5) THEN 2
          ELSE 3
        END,
        stock_actual ASC
    `;

    return result;
  }

  async refreshMaterializedViews() {
    // Agregar job a la cola para refresh asíncrono
    const job = await this.reportesQueue.add('refresh-mv', {
      timestamp: new Date(),
    });

    return {
      jobId: job.id,
      status: 'queued',
      message: 'Actualización de vistas materializadas iniciada',
    };
  }

  async executeMaterializedViewRefresh() {
    try {
      // Refrescar vistas materializadas si existen
      await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS mv_analisis_ventas`;
      await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS mv_productos_vendidos`;
      await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY IF EXISTS mv_inventario_rotacion`;
      
      this.logger.log('Vistas materializadas actualizadas exitosamente');
      return { success: true };
    } catch (error) {
      this.logger.error('Error actualizando vistas materializadas', error);
      throw error;
    }
  }
}
*/
