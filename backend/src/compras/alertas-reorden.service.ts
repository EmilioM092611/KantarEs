/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertasReordenService {
  private readonly logger = new Logger(AlertasReordenService.name);

  constructor(
    private prisma: PrismaService,
    // Si tienes EventsGateway, descomenta esto:
    // private eventsGateway: EventsGateway,
  ) {}

  // Ejecutar cada día a las 8:00 AM
  @Cron('0 8 * * *', {
    name: 'verificar-stock-minimo',
    timeZone: 'America/Mexico_City',
  })
  async verificarStockMinimo() {
    this.logger.log('Iniciando verificación de stock mínimo...');

    try {
      // Buscar productos bajo stock mínimo
      const productosbajoStock = await this.prisma.productos.findMany({
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
          categorias: true,
          unidades_medida: true,
          inventario: true,
        },
      });

      if (productosbajoStock.length === 0) {
        this.logger.log('No hay productos bajo stock mínimo');
        return;
      }

      this.logger.log(
        `Encontrados ${productosbajoStock.length} productos bajo stock mínimo`,
      );

      // Generar sugerencias de compra
      const sugerencias =
        await this.generarSugerenciasCompra(productosbajoStock);

      // Crear notificaciones
      await this.crearNotificaciones(productosbajoStock, sugerencias);

      // Enviar alertas en tiempo real via WebSocket (si está configurado)
      // this.eventsGateway.emitToRole('Gerente', 'alerta:stock-bajo', {
      //   productos: productosbajoStock.length,
      //   sugerencias,
      //   fecha: new Date(),
      // });

      this.logger.log('Verificación de stock completada');
    } catch (error) {
      this.logger.error('Error en verificación de stock', error);
    }
  }

  private async generarSugerenciasCompra(productos: any[]): Promise<any[]> {
    const sugerencias: any[] = [];

    for (const producto of productos) {
      if (!producto.inventario) continue;

      // Calcular cantidad sugerida (hasta stock máximo)
      const stockActual = Number(producto.inventario.stock_actual);
      const stockMinimo = Number(producto.inventario.stock_minimo);
      const stockMaximo = Number(
        producto.inventario.stock_maximo || stockMinimo * 3,
      );

      const cantidadSugerida = stockMaximo - stockActual;

      // Buscar mejor proveedor
      const mejorProveedor =
        await this.prisma.proveedor_producto_precio.findFirst({
          where: {
            id_producto: producto.id_producto,
            activo: true,
            OR: [{ fecha_fin: null }, { fecha_fin: { gte: new Date() } }],
          },
          include: {
            proveedores: {
              select: {
                id_proveedor: true,
                nombre_comercial: true,
                calificacion: true,
              },
            },
          },
          orderBy: [{ es_preferido: 'desc' }, { precio: 'asc' }],
        });

      sugerencias.push({
        producto: {
          id: producto.id_producto,
          nombre: producto.nombre,
          sku: producto.sku,
        },
        stock_actual: stockActual,
        stock_minimo: stockMinimo,
        stock_maximo: stockMaximo,
        cantidad_sugerida: cantidadSugerida,
        proveedor_recomendado: mejorProveedor
          ? {
              id: mejorProveedor.proveedores.id_proveedor,
              nombre: mejorProveedor.proveedores.nombre_comercial,
              precio: mejorProveedor.precio,
              calificacion: mejorProveedor.proveedores.calificacion,
            }
          : null,
        prioridad: this.calcularPrioridad(stockActual, stockMinimo),
      });
    }

    // Ordenar por prioridad
    sugerencias.sort((a, b) => b.prioridad - a.prioridad);

    return sugerencias;
  }

  private calcularPrioridad(stockActual: number, stockMinimo: number): number {
    const porcentajeStock = (stockActual / stockMinimo) * 100;

    if (porcentajeStock <= 25) return 3; // Crítico
    if (porcentajeStock <= 50) return 2; // Alto
    return 1; // Medio
  }

  private async crearNotificaciones(
    productos: any[],
    sugerencias: any[],
  ): Promise<void> {
    // Crear notificación general
    await this.prisma.notificaciones.create({
      data: {
        tipo: 'alerta_stock',
        titulo: `${productos.length} productos bajo stock mínimo`,
        mensaje: `Se requiere atención para reabastecer inventario`,
        prioridad: 'alta',
        canal: 'websocket',
        // Si tu modelo tiene data_adicional, descomenta esto:
        // data_adicional: { sugerencias },
      },
    });

    // Crear notificaciones individuales para productos críticos
    const productosCriticos = productos.filter(
      (p) =>
        p.inventario &&
        Number(p.inventario.stock_actual) <=
          Number(p.inventario.stock_minimo) * 0.5,
    );

    for (const producto of productosCriticos) {
      await this.prisma.notificaciones.create({
        data: {
          tipo: 'alerta_stock_critico',
          titulo: `Stock crítico: ${producto.nombre}`,
          mensaje: `Stock actual: ${producto.inventario.stock_actual}, Mínimo: ${producto.inventario.stock_minimo}`,
          prioridad: 'critica',
          canal: 'websocket',
        },
      });
    }
  }

  // Endpoint manual para ejecutar verificación
  async ejecutarVerificacionManual(): Promise<any> {
    await this.verificarStockMinimo();
    return { mensaje: 'Verificación ejecutada manualmente' };
  }

  // Obtener productos que requieren reorden
  async getProductosRequierenReorden(): Promise<any> {
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
        categorias: true,
        unidades_medida: true,
        inventario: true,
      },
      orderBy: {
        inventario: {
          stock_actual: 'asc',
        },
      },
    });

    const sugerencias = await this.generarSugerenciasCompra(productos);

    const productosCriticos = productos.filter(
      (p) =>
        p.inventario &&
        Number(p.inventario.stock_actual) <=
          Number(p.inventario.stock_minimo) * 0.5,
    ).length;

    return {
      total_productos: productos.length,
      productos_criticos: productosCriticos,
      productos,
      sugerencias,
    };
  }
}
