import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { AdjustInventarioDto } from './dto/adjust-inventario.dto';
import { FilterInventarioDto, StockStatus } from './dto/filter-inventario.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula el estado del stock de un producto
   */
  private calcularEstadoStock(
    stockActual: number,
    stockMinimo: number,
    puntoReorden?: number,
    stockMaximo?: number,
  ): StockStatus {
    if (stockActual <= 0) return StockStatus.CRITICO;
    if (stockActual < stockMinimo) return StockStatus.CRITICO;
    if (puntoReorden && stockActual <= puntoReorden) return StockStatus.BAJO;
    if (stockMaximo && stockActual > stockMaximo) return StockStatus.EXCESO;
    return StockStatus.NORMAL;
  }

  async create(createInventarioDto: CreateInventarioDto) {
    // Verificar que el producto existe
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: createInventarioDto.id_producto },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${createInventarioDto.id_producto} no encontrado`,
      );
    }

    // Verificar que el producto sea inventariable
    if (!producto.es_inventariable) {
      throw new BadRequestException('Este producto no es inventariable');
    }

    // Verificar que no exista inventario para este producto
    const inventarioExistente = await this.prisma.inventario.findUnique({
      where: { id_producto: createInventarioDto.id_producto },
    });

    if (inventarioExistente) {
      throw new ConflictException('Ya existe un inventario para este producto');
    }

    try {
      return await this.prisma.inventario.create({
        data: {
          id_producto: createInventarioDto.id_producto,
          stock_actual: createInventarioDto.stock_actual
            ? new Prisma.Decimal(createInventarioDto.stock_actual)
            : new Prisma.Decimal(0),
          stock_minimo: new Prisma.Decimal(createInventarioDto.stock_minimo),
          stock_maximo: createInventarioDto.stock_maximo
            ? new Prisma.Decimal(createInventarioDto.stock_maximo)
            : null,
          punto_reorden: createInventarioDto.punto_reorden
            ? new Prisma.Decimal(createInventarioDto.punto_reorden)
            : null,
          ubicacion_almacen: createInventarioDto.ubicacion_almacen,
          lote_actual: createInventarioDto.lote_actual,
          requiere_refrigeracion: createInventarioDto.requiere_refrigeracion,
          dias_caducidad: createInventarioDto.dias_caducidad,
          fecha_ultimo_inventario: new Date(),
        },
        include: {
          productos: {
            select: {
              sku: true,
              nombre: true,
              unidades_medida: {
                select: {
                  nombre: true,
                  abreviatura: true,
                },
              },
              categorias: {
                select: {
                  nombre: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe inventario para este producto');
      }
      throw error;
    }
  }

  async findAll(filters?: FilterInventarioDto) {
    const where: Prisma.inventarioWhereInput = {};

    if (filters?.id_producto) {
      where.id_producto = filters.id_producto;
    }

    if (filters?.requiere_refrigeracion !== undefined) {
      where.requiere_refrigeracion = filters.requiere_refrigeracion;
    }

    if (filters?.ubicacion_almacen) {
      where.ubicacion_almacen = {
        contains: filters.ubicacion_almacen,
        mode: 'insensitive',
      };
    }

    if (filters?.solo_bajo_stock) {
      where.stock_actual = {
        lte: this.prisma.inventario.fields.stock_minimo,
      };
    }

    const inventarios = await this.prisma.inventario.findMany({
      where,
      include: {
        productos: {
          select: {
            sku: true,
            nombre: true,
            disponible: true,
            unidades_medida: {
              select: {
                nombre: true,
                abreviatura: true,
              },
            },
            categorias: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        productos: {
          nombre: 'asc',
        },
      },
    });

    // Aplicar filtros de estado y punto de reorden en memoria
    let resultado = inventarios;

    if (filters?.punto_reorden_alcanzado) {
      resultado = resultado.filter(
        (inv) =>
          inv.punto_reorden &&
          Number(inv.stock_actual) <= Number(inv.punto_reorden),
      );
    }

    if (filters?.estado) {
      resultado = resultado.filter((inv) => {
        const estado = this.calcularEstadoStock(
          Number(inv.stock_actual),
          Number(inv.stock_minimo),
          inv.punto_reorden ? Number(inv.punto_reorden) : undefined,
          inv.stock_maximo ? Number(inv.stock_maximo) : undefined,
        );
        return estado === filters.estado;
      });
    }

    // Agregar estado calculado a cada inventario
    return resultado.map((inv) => ({
      ...inv,
      estado_stock: this.calcularEstadoStock(
        Number(inv.stock_actual),
        Number(inv.stock_minimo),
        inv.punto_reorden ? Number(inv.punto_reorden) : undefined,
        inv.stock_maximo ? Number(inv.stock_maximo) : undefined,
      ),
    }));
  }

  async findOne(id: number) {
    const inventario = await this.prisma.inventario.findUnique({
      where: { id_inventario: id },
      include: {
        productos: {
          select: {
            sku: true,
            nombre: true,
            descripcion: true,
            disponible: true,
            precio_venta: true,
            costo_promedio: true,
            unidades_medida: {
              select: {
                nombre: true,
                abreviatura: true,
              },
            },
            categorias: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!inventario) {
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    }

    return {
      ...inventario,
      estado_stock: this.calcularEstadoStock(
        Number(inventario.stock_actual),
        Number(inventario.stock_minimo),
        inventario.punto_reorden ? Number(inventario.punto_reorden) : undefined,
        inventario.stock_maximo ? Number(inventario.stock_maximo) : undefined,
      ),
    };
  }

  async findByProducto(idProducto: number) {
    const inventario = await this.prisma.inventario.findUnique({
      where: { id_producto: idProducto },
      include: {
        productos: {
          select: {
            sku: true,
            nombre: true,
            unidades_medida: {
              select: {
                nombre: true,
                abreviatura: true,
              },
            },
          },
        },
      },
    });

    if (!inventario) {
      throw new NotFoundException(
        `No existe inventario para el producto con ID ${idProducto}`,
      );
    }

    return {
      ...inventario,
      estado_stock: this.calcularEstadoStock(
        Number(inventario.stock_actual),
        Number(inventario.stock_minimo),
        inventario.punto_reorden ? Number(inventario.punto_reorden) : undefined,
        inventario.stock_maximo ? Number(inventario.stock_maximo) : undefined,
      ),
    };
  }

  async update(id: number, updateInventarioDto: UpdateInventarioDto) {
    await this.findOne(id);

    return await this.prisma.inventario.update({
      where: { id_inventario: id },
      data: {
        stock_minimo: updateInventarioDto.stock_minimo
          ? new Prisma.Decimal(updateInventarioDto.stock_minimo)
          : undefined,
        stock_maximo: updateInventarioDto.stock_maximo
          ? new Prisma.Decimal(updateInventarioDto.stock_maximo)
          : undefined,
        punto_reorden: updateInventarioDto.punto_reorden
          ? new Prisma.Decimal(updateInventarioDto.punto_reorden)
          : undefined,
        ubicacion_almacen: updateInventarioDto.ubicacion_almacen,
        lote_actual: updateInventarioDto.lote_actual,
        requiere_refrigeracion: updateInventarioDto.requiere_refrigeracion,
        dias_caducidad: updateInventarioDto.dias_caducidad,
      },
      include: {
        productos: {
          select: {
            sku: true,
            nombre: true,
            unidades_medida: {
              select: {
                nombre: true,
                abreviatura: true,
              },
            },
          },
        },
      },
    });
  }

  async adjustStock(id: number, adjustInventarioDto: AdjustInventarioDto) {
    const inventario = await this.findOne(id);

    const stockAnterior = Number(inventario.stock_actual);
    const nuevoStock = Number(adjustInventarioDto.nuevo_stock);

    // Actualizar inventario
    const inventarioActualizado = await this.prisma.inventario.update({
      where: { id_inventario: id },
      data: {
        stock_actual: new Prisma.Decimal(nuevoStock),
        fecha_ultimo_inventario: new Date(),
      },
      include: {
        productos: true,
      },
    });

    return {
      ...inventarioActualizado,
      stock_anterior: stockAnterior,
      diferencia: nuevoStock - stockAnterior,
      motivo: adjustInventarioDto.motivo,
    };
  }

  async getProductosBajoStock() {
    const inventarios = await this.prisma.inventario.findMany({
      where: {
        stock_actual: {
          lte: this.prisma.inventario.fields.stock_minimo,
        },
      },
      include: {
        productos: {
          select: {
            sku: true,
            nombre: true,
            disponible: true,
            unidades_medida: {
              select: {
                nombre: true,
                abreviatura: true,
              },
            },
            categorias: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        stock_actual: 'asc',
      },
    });

    return inventarios.map((inv) => ({
      ...inv,
      estado_stock: this.calcularEstadoStock(
        Number(inv.stock_actual),
        Number(inv.stock_minimo),
        inv.punto_reorden ? Number(inv.punto_reorden) : undefined,
        inv.stock_maximo ? Number(inv.stock_maximo) : undefined,
      ),
      faltante: Number(inv.stock_minimo) - Number(inv.stock_actual),
    }));
  }

  async getProductosReorden() {
    const inventarios = await this.prisma.inventario.findMany({
      where: {
        punto_reorden: {
          not: null,
        },
      },
      include: {
        productos: {
          select: {
            sku: true,
            nombre: true,
            disponible: true,
            unidades_medida: {
              select: {
                nombre: true,
                abreviatura: true,
              },
            },
            categorias: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    // Filtrar solo los que alcanzaron el punto de reorden
    const enPuntoReorden = inventarios.filter(
      (inv) =>
        inv.punto_reorden &&
        Number(inv.stock_actual) <= Number(inv.punto_reorden),
    );

    return enPuntoReorden.map((inv) => ({
      ...inv,
      estado_stock: StockStatus.BAJO,
      cantidad_sugerida: inv.stock_maximo
        ? Number(inv.stock_maximo) - Number(inv.stock_actual)
        : Number(inv.punto_reorden) * 2,
    }));
  }

  async getEstadisticas() {
    const inventarios = await this.prisma.inventario.findMany({
      include: {
        productos: {
          select: {
            costo_promedio: true,
            precio_venta: true,
          },
        },
      },
    });

    const total = inventarios.length;
    const critico = inventarios.filter(
      (inv) => Number(inv.stock_actual) <= Number(inv.stock_minimo),
    ).length;
    const puntoReorden = inventarios.filter(
      (inv) =>
        inv.punto_reorden &&
        Number(inv.stock_actual) <= Number(inv.punto_reorden) &&
        Number(inv.stock_actual) > Number(inv.stock_minimo),
    ).length;

    const valorInventario = inventarios.reduce((sum, inv) => {
      const costo = Number(inv.productos.costo_promedio || 0);
      const cantidad = Number(inv.stock_actual);
      return sum + costo * cantidad;
    }, 0);

    return {
      total_productos: total,
      productos_criticos: critico,
      productos_punto_reorden: puntoReorden,
      productos_normal: total - critico - puntoReorden,
      valor_total_inventario: valorInventario.toFixed(2),
    };
  }
}
