import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// ^ ajusta el path si tu estructura es distinta
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { AdjustInventarioDto } from './dto/adjust-inventario.dto';
import { FilterInventarioDto, StockStatus } from './dto/filter-inventario.dto';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheUtil } from '../cache/cache-util.service';

@Injectable()
export class InventarioService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly cacheUtil: CacheUtil, // <<<<<< NEW
  ) {}

  // TTLs en milisegundos (cache-manager v5)
  private readonly DEFAULT_TTL = 60_000; // 60s listas/detalles
  private readonly STATS_TTL = 60_000; // 60s agregados

  // ---------- Helpers de claves ----------
  private keyList(filters?: FilterInventarioDto) {
    const safe = {
      id_producto: filters?.id_producto ?? null,
      requiere_refrigeracion: filters?.requiere_refrigeracion ?? null,
      ubicacion_almacen:
        (filters?.ubicacion_almacen ?? '').toLowerCase() || null,
      solo_bajo_stock: !!filters?.solo_bajo_stock,
      punto_reorden_alcanzado: !!filters?.punto_reorden_alcanzado,
      estado: filters?.estado ?? null,
    };
    return `inventario:list:${JSON.stringify(safe)}`;
  }

  private keyById(id: number) {
    return `inventario:id:${id}`;
  }

  private keyByProducto(idProducto: number) {
    return `inventario:producto:${idProducto}`;
  }

  private keyBajoStock() {
    return 'inventario:bajo-stock';
  }

  private keyReorden() {
    return 'inventario:reorden';
  }

  private keyStats() {
    return 'inventario:stats';
  }

  /** Invalida listas y agregados del módulo de inventario */
  private async invalidateListsAndAggregates() {
    await this.cacheUtil.invalidate({
      patterns: ['inventario:list:*'],
      keys: [this.keyBajoStock(), this.keyReorden(), this.keyStats()],
    });
  }

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
      const inv = await this.prisma.inventario.create({
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
                select: { nombre: true, abreviatura: true },
              },
              categorias: { select: { nombre: true } },
            },
          },
        },
      });

      // invalidación selectiva
      await this.invalidateListsAndAggregates();
      await this.cacheUtil.invalidate({
        keys: [this.keyByProducto(inv.id_producto)],
      });

      return inv;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe inventario para este producto');
      }
      throw error;
    }
  }

  async findAll(filters?: FilterInventarioDto) {
    const listKey = this.keyList(filters);
    const cached = await this.cache.get<any[]>(listKey);
    if (cached) return cached;

    const where: Prisma.inventarioWhereInput = {};

    if (filters?.id_producto) where.id_producto = filters.id_producto;
    if (filters?.requiere_refrigeracion !== undefined)
      where.requiere_refrigeracion = filters.requiere_refrigeracion;
    if (filters?.ubicacion_almacen) {
      where.ubicacion_almacen = {
        contains: filters.ubicacion_almacen,
        mode: 'insensitive',
      };
    }
    if (filters?.solo_bajo_stock) {
      where.stock_actual = { lte: this.prisma.inventario.fields.stock_minimo };
    }

    const inventarios = await this.prisma.inventario.findMany({
      where,
      include: {
        productos: {
          select: {
            sku: true,
            nombre: true,
            disponible: true,
            unidades_medida: { select: { nombre: true, abreviatura: true } },
            categorias: { select: { nombre: true } },
          },
        },
      },
      orderBy: { productos: { nombre: 'asc' } },
    });

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

    const finalData = resultado.map((inv) => ({
      ...inv,
      estado_stock: this.calcularEstadoStock(
        Number(inv.stock_actual),
        Number(inv.stock_minimo),
        inv.punto_reorden ? Number(inv.punto_reorden) : undefined,
        inv.stock_maximo ? Number(inv.stock_maximo) : undefined,
      ),
    }));

    await this.cache.set(listKey, finalData, this.DEFAULT_TTL);
    return finalData;
  }

  async findOne(id: number) {
    const key = this.keyById(id);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

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
            unidades_medida: { select: { nombre: true, abreviatura: true } },
            categorias: { select: { nombre: true } },
          },
        },
      },
    });

    if (!inventario) {
      throw new NotFoundException(`Inventario con ID ${id} no encontrado`);
    }

    const enriched = {
      ...inventario,
      estado_stock: this.calcularEstadoStock(
        Number(inventario.stock_actual),
        Number(inventario.stock_minimo),
        inventario.punto_reorden ? Number(inventario.punto_reorden) : undefined,
        inventario.stock_maximo ? Number(inventario.stock_maximo) : undefined,
      ),
    };

    await this.cache.set(key, enriched, this.DEFAULT_TTL);
    return enriched;
  }

  async findByProducto(idProducto: number) {
    const key = this.keyByProducto(idProducto);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const inventario = await this.prisma.inventario.findUnique({
      where: { id_producto: idProducto },
      include: {
        productos: {
          select: {
            sku: true,
            nombre: true,
            unidades_medida: { select: { nombre: true, abreviatura: true } },
          },
        },
      },
    });

    if (!inventario) {
      throw new NotFoundException(
        `No existe inventario para el producto con ID ${idProducto}`,
      );
    }

    const enriched = {
      ...inventario,
      estado_stock: this.calcularEstadoStock(
        Number(inventario.stock_actual),
        Number(inventario.stock_minimo),
        inventario.punto_reorden ? Number(inventario.punto_reorden) : undefined,
        inventario.stock_maximo ? Number(inventario.stock_maximo) : undefined,
      ),
    };

    await this.cache.set(key, enriched, this.DEFAULT_TTL);
    return enriched;
  }

  async update(id: number, updateInventarioDto: UpdateInventarioDto) {
    await this.findOne(id);

    const updated = await this.prisma.inventario.update({
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
            unidades_medida: { select: { nombre: true, abreviatura: true } },
          },
        },
      },
    });

    await this.cacheUtil.invalidate({
      keys: [
        this.keyById(id),
        ...(updated?.id_producto
          ? [this.keyByProducto(updated.id_producto)]
          : []),
      ],
      patterns: ['inventario:list:*'],
    });
    // stats y listas dependientes
    await this.cacheUtil.invalidate({
      keys: [this.keyBajoStock(), this.keyReorden(), this.keyStats()],
    });

    return updated;
  }

  async adjustStock(id: number, adjustInventarioDto: AdjustInventarioDto) {
    const inventario = await this.findOne(id);

    const stockAnterior = Number(inventario.stock_actual);
    const nuevoStock = Number(adjustInventarioDto.nuevo_stock);

    const inventarioActualizado = await this.prisma.inventario.update({
      where: { id_inventario: id },
      data: {
        stock_actual: new Prisma.Decimal(nuevoStock),
        fecha_ultimo_inventario: new Date(),
      },
      include: { productos: true },
    });

    await this.cacheUtil.invalidate({
      keys: [
        this.keyById(id),
        ...(inventarioActualizado?.id_producto
          ? [this.keyByProducto(inventarioActualizado.id_producto)]
          : []),
      ],
      patterns: ['inventario:list:*'],
    });
    await this.cacheUtil.invalidate({
      keys: [this.keyBajoStock(), this.keyReorden(), this.keyStats()],
    });

    return {
      ...inventarioActualizado,
      stock_anterior: stockAnterior,
      diferencia: nuevoStock - stockAnterior,
      motivo: adjustInventarioDto.motivo,
    };
  }

  async getProductosBajoStock() {
    const key = this.keyBajoStock();
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const inventarios = await this.prisma.inventario.findMany({
      where: {
        stock_actual: { lte: this.prisma.inventario.fields.stock_minimo },
      },
      include: {
        productos: {
          select: {
            sku: true,
            nombre: true,
            disponible: true,
            unidades_medida: { select: { nombre: true, abreviatura: true } },
            categorias: { select: { nombre: true } },
          },
        },
      },
      orderBy: { stock_actual: 'asc' },
    });

    const data = inventarios.map((inv) => ({
      ...inv,
      estado_stock: this.calcularEstadoStock(
        Number(inv.stock_actual),
        Number(inv.stock_minimo),
        inv.punto_reorden ? Number(inv.punto_reorden) : undefined,
        inv.stock_maximo ? Number(inv.stock_maximo) : undefined,
      ),
      faltante: Number(inv.stock_minimo) - Number(inv.stock_actual),
    }));

    await this.cache.set(key, data, this.DEFAULT_TTL);
    return data;
  }

  async getProductosReorden() {
    const key = this.keyReorden();
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const inventarios = await this.prisma.inventario.findMany({
      where: { punto_reorden: { not: null } },
      include: {
        productos: {
          select: {
            sku: true,
            nombre: true,
            disponible: true,
            unidades_medida: { select: { nombre: true, abreviatura: true } },
            categorias: { select: { nombre: true } },
          },
        },
      },
    });

    const enPuntoReorden = inventarios.filter(
      (inv) =>
        inv.punto_reorden &&
        Number(inv.stock_actual) <= Number(inv.punto_reorden),
    );

    const data = enPuntoReorden.map((inv) => ({
      ...inv,
      estado_stock: StockStatus.BAJO,
      cantidad_sugerida: inv.stock_maximo
        ? Number(inv.stock_maximo) - Number(inv.stock_actual)
        : Number(inv.punto_reorden) * 2,
    }));

    await this.cache.set(key, data, this.DEFAULT_TTL);
    return data;
  }

  async getEstadisticas() {
    const key = this.keyStats();
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const inventarios = await this.prisma.inventario.findMany({
      include: {
        productos: { select: { costo_promedio: true, precio_venta: true } },
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

    const result = {
      total_productos: total,
      productos_criticos: critico,
      productos_punto_reorden: puntoReorden,
      productos_normal: total - critico - puntoReorden,
      valor_total_inventario: valorInventario.toFixed(2),
    };

    await this.cache.set(key, result, this.STATS_TTL);
    return result;
  }
}
