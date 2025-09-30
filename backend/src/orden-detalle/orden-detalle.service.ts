// ============== orden-detalle.service.ts ==============
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryItemsDto } from './dto/query-items.dto';
import { BatchUpdateEstadoDto } from './dto/batch-update-estado.dto';
import { EstadisticasCocinaDto } from './dto/estadisticas-cocina.dto';
import { estado_orden_detalle, Prisma } from '@prisma/client';

@Injectable()
export class OrdenDetalleService {
  constructor(private readonly prisma: PrismaService) {}

  // ========== LISTAR ITEMS CON FILTROS ==========
  async findAll(query: QueryItemsDto) {
    const where: Prisma.orden_detalleWhereInput = {};

    if (query.estado) {
      where.estado = query.estado;
    }

    if (query.id_producto) {
      where.id_producto = query.id_producto;
    }

    if (query.id_usuario_prepara) {
      where.id_usuario_prepara = query.id_usuario_prepara;
    }

    if (query.fecha_desde || query.fecha_hasta) {
      where.created_at = {};
      if (query.fecha_desde) {
        where.created_at.gte = query.fecha_desde;
      }
      if (query.fecha_hasta) {
        where.created_at.lte = query.fecha_hasta;
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.orden_detalle.findMany({
        where,
        include: {
          productos: {
            include: {
              categorias: true,
            },
          },
          ordenes: {
            include: {
              sesiones_mesa: {
                include: {
                  mesas: true,
                },
              },
            },
          },
          usuarios: {
            select: {
              username: true,
              personas: {
                select: {
                  nombre: true,
                  apellido_paterno: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: query.limit || 50,
        skip: query.offset || 0,
      }),
      this.prisma.orden_detalle.count({ where }),
    ]);

    return {
      data: items,
      total,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };
  }

  // ========== OBTENER UN ITEM ESPECÍFICO ==========
  async findOne(id: number) {
    const item = await this.prisma.orden_detalle.findUnique({
      where: { id_detalle: id },
      include: {
        productos: {
          include: {
            categorias: true,
            unidades_medida: true,
          },
        },
        ordenes: {
          include: {
            estados_orden: true,
            sesiones_mesa: {
              include: {
                mesas: true,
              },
            },
          },
        },
        usuarios: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item con ID ${id} no encontrado`);
    }

    return item;
  }

  // ========== ITEMS POR CATEGORÍA ==========
  async findByCategoria(categoriaId: number) {
    return this.prisma.orden_detalle.findMany({
      where: {
        productos: {
          id_categoria: categoriaId,
        },
        estado: {
          in: ['pendiente', 'preparando'],
        },
      },
      include: {
        productos: true,
        ordenes: {
          include: {
            sesiones_mesa: {
              include: {
                mesas: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  // ========== VISTA DE COCINA POR ÁREA ==========
  async getCocinaView(area?: 'cocina' | 'barra') {
    const whereArea = area
      ? {
          productos: {
            categorias: {
              tipos_producto: {
                area_preparacion: area,
              },
            },
          },
        }
      : {};

    return this.prisma.orden_detalle.findMany({
      where: {
        ...whereArea,
        estado: {
          in: ['pendiente', 'preparando'],
        },
        ordenes: {
          estados_orden: {
            nombre: {
              in: ['confirmada', 'preparando'],
            },
          },
        },
      },
      include: {
        productos: {
          include: {
            categorias: true,
          },
        },
        ordenes: {
          include: {
            sesiones_mesa: {
              include: {
                mesas: true,
              },
            },
            usuarios: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: [{ estado: 'asc' }, { created_at: 'asc' }],
    });
  }

  // ========== ACTUALIZACIÓN BATCH DE ESTADOS ==========
  async batchUpdateEstado(dto: BatchUpdateEstadoDto, userId: number) {
    // Verificar que todos los items existen
    const items = await this.prisma.orden_detalle.findMany({
      where: {
        id_detalle: {
          in: dto.itemIds,
        },
      },
      include: {
        ordenes: {
          include: {
            estados_orden: true,
          },
        },
      },
    });

    if (items.length !== dto.itemIds.length) {
      throw new NotFoundException('Algunos items no fueron encontrados');
    }

    // Verificar que ninguno esté cancelado
    const cancelados = items.filter((i) => i.estado === 'cancelado');
    if (cancelados.length > 0) {
      throw new BadRequestException('No se pueden modificar items cancelados');
    }

    // Verificar que las órdenes no estén pagadas
    const ordenesPagadas = items.filter(
      (i) => i.ordenes.estados_orden.nombre === 'pagada',
    );
    if (ordenesPagadas.length > 0) {
      throw new BadRequestException(
        'No se pueden modificar items de órdenes pagadas',
      );
    }

    // Actualizar todos los items
    return this.prisma.$transaction(async (tx) => {
      await tx.orden_detalle.updateMany({
        where: {
          id_detalle: {
            in: dto.itemIds,
          },
        },
        data: {
          estado: dto.estado,
          id_usuario_prepara: dto.estado === 'preparando' ? userId : undefined,
          tiempo_preparacion_real:
            dto.estado === 'listo'
              ? { set: 0 } // Se calculará individualmente
              : undefined,
          updated_at: new Date(),
        },
      });

      // Si se marcan como listos, calcular tiempo de preparación individual
      if (dto.estado === 'listo') {
        for (const item of items) {
          const tiempoPreparacion = Math.floor(
            (new Date().getTime() - item.created_at!.getTime()) / 60000,
          );

          await tx.orden_detalle.update({
            where: { id_detalle: item.id_detalle },
            data: {
              tiempo_preparacion_real: tiempoPreparacion,
            },
          });
        }
      }

      return {
        message: `${dto.itemIds.length} items actualizados a ${dto.estado}`,
        itemIds: dto.itemIds,
      };
    });
  }

  // ========== ESTADÍSTICAS DE COCINA ==========
  async getEstadisticasCocina(dto: EstadisticasCocinaDto) {
    const fechaDesde =
      dto.fecha_desde || new Date(new Date().setHours(0, 0, 0, 0));
    const fechaHasta = dto.fecha_hasta || new Date();

    const [
      totalItems,
      itemsPendientes,
      itemsPreparando,
      itemsListos,
      itemsServidos,
      itemsCancelados,
      tiempoPromedioPreparacion,
      productosMasVendidos,
      itemsPorHora,
    ] = await Promise.all([
      // Total de items del período
      this.prisma.orden_detalle.count({
        where: {
          created_at: {
            gte: fechaDesde,
            lte: fechaHasta,
          },
        },
      }),

      // Items pendientes
      this.prisma.orden_detalle.count({
        where: {
          created_at: {
            gte: fechaDesde,
            lte: fechaHasta,
          },
          estado: 'pendiente',
        },
      }),

      // Items preparando
      this.prisma.orden_detalle.count({
        where: {
          created_at: {
            gte: fechaDesde,
            lte: fechaHasta,
          },
          estado: 'preparando',
        },
      }),

      // Items listos
      this.prisma.orden_detalle.count({
        where: {
          created_at: {
            gte: fechaDesde,
            lte: fechaHasta,
          },
          estado: 'listo',
        },
      }),

      // Items servidos
      this.prisma.orden_detalle.count({
        where: {
          created_at: {
            gte: fechaDesde,
            lte: fechaHasta,
          },
          estado: 'servido',
        },
      }),

      // Items cancelados
      this.prisma.orden_detalle.count({
        where: {
          created_at: {
            gte: fechaDesde,
            lte: fechaHasta,
          },
          estado: 'cancelado',
        },
      }),

      // Tiempo promedio de preparación
      this.prisma.orden_detalle.aggregate({
        where: {
          created_at: {
            gte: fechaDesde,
            lte: fechaHasta,
          },
          tiempo_preparacion_real: {
            not: null,
          },
        },
        _avg: {
          tiempo_preparacion_real: true,
        },
      }),

      // Top 5 productos más vendidos
      this.prisma.orden_detalle.groupBy({
        by: ['id_producto'],
        where: {
          created_at: {
            gte: fechaDesde,
            lte: fechaHasta,
          },
          estado: {
            not: 'cancelado',
          },
        },
        _count: {
          id_detalle: true,
        },
        _sum: {
          cantidad: true,
        },
        orderBy: {
          _count: {
            id_detalle: 'desc',
          },
        },
        take: 5,
      }),

      // Items por hora (distribución)
      this.getItemsPorHora(fechaDesde, fechaHasta),
    ]);

    // Obtener nombres de productos más vendidos
    const productosInfo = await this.prisma.productos.findMany({
      where: {
        id_producto: {
          in: productosMasVendidos.map((p) => p.id_producto),
        },
      },
      select: {
        id_producto: true,
        nombre: true,
        sku: true,
      },
    });

    const topProductos = productosMasVendidos.map((p) => {
      const info = productosInfo.find((pi) => pi.id_producto === p.id_producto);
      return {
        id_producto: p.id_producto,
        nombre: info?.nombre || 'Producto desconocido',
        sku: info?.sku || '',
        veces_vendido: p._count.id_detalle,
        cantidad_total: p._sum.cantidad || 0,
      };
    });

    return {
      periodo: {
        desde: fechaDesde,
        hasta: fechaHasta,
      },
      resumen: {
        total_items: totalItems,
        pendientes: itemsPendientes,
        preparando: itemsPreparando,
        listos: itemsListos,
        servidos: itemsServidos,
        cancelados: itemsCancelados,
        porcentaje_cumplimiento:
          totalItems > 0 ? ((itemsServidos / totalItems) * 100).toFixed(2) : 0,
      },
      tiempos: {
        promedio_preparacion_minutos:
          tiempoPromedioPreparacion._avg.tiempo_preparacion_real || 0,
      },
      productos_top: topProductos,
      distribucion_horaria: itemsPorHora,
    };
  }

  // ========== REPORTE DE TIEMPOS ==========
  async getReporteTiempos() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const tiemposPorCategoria = await this.prisma.orden_detalle.groupBy({
      by: ['id_producto'],
      where: {
        created_at: {
          gte: hoy,
        },
        tiempo_preparacion_real: {
          not: null,
        },
      },
      _avg: {
        tiempo_preparacion_real: true,
      },
      _min: {
        tiempo_preparacion_real: true,
      },
      _max: {
        tiempo_preparacion_real: true,
      },
      _count: {
        id_detalle: true,
      },
    });

    // Obtener información de productos y categorías
    const productos = await this.prisma.productos.findMany({
      where: {
        id_producto: {
          in: tiemposPorCategoria.map((t) => t.id_producto),
        },
      },
      include: {
        categorias: true,
      },
    });

    const reporte = tiemposPorCategoria.map((tiempo) => {
      const producto = productos.find(
        (p) => p.id_producto === tiempo.id_producto,
      );
      return {
        producto: producto?.nombre || 'Desconocido',
        categoria: producto?.categorias.nombre || 'Sin categoría',
        tiempo_esperado: producto?.tiempo_preparacion_min || 0,
        tiempo_promedio: tiempo._avg.tiempo_preparacion_real || 0,
        tiempo_minimo: tiempo._min.tiempo_preparacion_real || 0,
        tiempo_maximo: tiempo._max.tiempo_preparacion_real || 0,
        cantidad_preparada: tiempo._count.id_detalle,
        eficiencia: producto?.tiempo_preparacion_min
          ? (
              (producto.tiempo_preparacion_min /
                (tiempo._avg.tiempo_preparacion_real || 1)) *
              100
            ).toFixed(2)
          : 0,
      };
    });

    return {
      fecha: hoy,
      reporte: reporte.sort(
        (a, b) => b.cantidad_preparada - a.cantidad_preparada,
      ),
    };
  }

  // ========== ITEMS PRIORITARIOS ==========
  async getItemsPrioritarios() {
    const ahora = new Date();
    const hace15Min = new Date(ahora.getTime() - 15 * 60000);
    const hace30Min = new Date(ahora.getTime() - 30 * 60000);

    const [urgentes, retrasados, normales] = await Promise.all([
      // Items urgentes (más de 30 minutos)
      this.prisma.orden_detalle.findMany({
        where: {
          estado: {
            in: ['pendiente', 'preparando'],
          },
          created_at: {
            lte: hace30Min,
          },
        },
        include: {
          productos: true,
          ordenes: {
            include: {
              sesiones_mesa: {
                include: {
                  mesas: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'asc' },
      }),

      // Items retrasados (15-30 minutos)
      this.prisma.orden_detalle.findMany({
        where: {
          estado: {
            in: ['pendiente', 'preparando'],
          },
          created_at: {
            gt: hace30Min,
            lte: hace15Min,
          },
        },
        include: {
          productos: true,
          ordenes: {
            include: {
              sesiones_mesa: {
                include: {
                  mesas: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'asc' },
      }),

      // Items normales (menos de 15 minutos)
      this.prisma.orden_detalle.findMany({
        where: {
          estado: {
            in: ['pendiente', 'preparando'],
          },
          created_at: {
            gt: hace15Min,
          },
        },
        include: {
          productos: true,
          ordenes: {
            include: {
              sesiones_mesa: {
                include: {
                  mesas: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'asc' },
      }),
    ]);

    return {
      urgentes: {
        cantidad: urgentes.length,
        items: urgentes,
      },
      retrasados: {
        cantidad: retrasados.length,
        items: retrasados,
      },
      normales: {
        cantidad: normales.length,
        items: normales,
      },
      total_pendientes: urgentes.length + retrasados.length + normales.length,
    };
  }

  // ========== HELPER: Items por hora ==========
  private async getItemsPorHora(fechaDesde: Date, fechaHasta: Date) {
    const items = await this.prisma.orden_detalle.findMany({
      where: {
        created_at: {
          gte: fechaDesde,
          lte: fechaHasta,
        },
      },
      select: {
        created_at: true,
      },
    });

    const distribucion: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      distribucion[i] = 0;
    }

    items.forEach((item) => {
      if (item.created_at) {
        const hora = item.created_at.getHours();
        distribucion[hora]++;
      }
    });

    return Object.entries(distribucion).map(([hora, cantidad]) => ({
      hora: parseInt(hora),
      cantidad,
    }));
  }
}
