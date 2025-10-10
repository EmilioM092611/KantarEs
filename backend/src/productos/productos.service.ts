import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { QueryProductosDto } from './dto/query-productos.dto';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheUtil } from '../cache/cache-util.service';

@Injectable()
export class ProductosService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly cacheUtil: CacheUtil,
  ) {}

  // TTLs (ms)
  private readonly DEFAULT_TTL = 900_000; // 15 min para list/detalle
  private readonly SEARCH_TTL = 30_000; // 30s para búsquedas
  private readonly STATS_TTL = 120_000; // 2 min para estadísticas

  // ---------- Keys ----------
  private keyList(q: QueryProductosDto) {
    const {
      page = 1,
      limit = 20,
      search = null,
      categoria = null,
      activo = null,
      disponible = null,
      ordenarPor = 'nombre',
      orden = 'asc',
    } = q || {};
    const safe = {
      page,
      limit,
      search,
      categoria,
      activo,
      disponible,
      ordenarPor,
      orden,
    };
    return `productos:list:${JSON.stringify(safe)}`;
  }
  private keyById(id: number) {
    return `productos:id:${id}`;
  }
  private keySearch(term: string) {
    return `productos:search:${(term ?? '').toLowerCase()}`;
  }
  private keyStats() {
    return 'productos:stats';
  }

  private async invalidateListsAndDerived() {
    await this.cacheUtil.invalidate({
      patterns: ['productos:list:*', 'productos:search:*'],
      keys: [this.keyStats()],
    });
  }

  // ---------- CREATE ----------
  async create(createProductoDto: CreateProductoDto) {
    // SKU único
    const existingProduct = await this.prisma.productos.findUnique({
      where: { sku: createProductoDto.codigo },
    });
    if (existingProduct) {
      throw new ConflictException(
        `El código ${createProductoDto.codigo} ya está en uso`,
      );
    }

    // Categoría existente
    const categoria = await this.prisma.categorias.findUnique({
      where: { id_categoria: createProductoDto.id_tipo_producto },
    });
    if (!categoria) throw new BadRequestException('La categoría no existe');

    // Unidad de medida existente
    const unidadMedida = await this.prisma.unidades_medida.findUnique({
      where: { id_unidad: createProductoDto.id_unidad_medida },
    });
    if (!unidadMedida)
      throw new BadRequestException('La unidad de medida no existe');

    // Validar stock min/max
    if (
      createProductoDto.stock_minimo &&
      createProductoDto.stock_maximo &&
      createProductoDto.stock_minimo >= createProductoDto.stock_maximo
    ) {
      throw new BadRequestException(
        'El stock mínimo debe ser menor al stock máximo',
      );
    }

    // Crear
    const producto = await this.prisma.productos.create({
      data: {
        sku: createProductoDto.codigo,
        nombre: createProductoDto.nombre,
        descripcion: createProductoDto.descripcion,
        id_categoria: createProductoDto.id_tipo_producto,
        id_unidad_medida: createProductoDto.id_unidad_medida,
        precio_venta: new Prisma.Decimal(createProductoDto.precio_venta),
        costo_promedio: createProductoDto.costo
          ? new Prisma.Decimal(createProductoDto.costo)
          : null,
        iva_tasa: createProductoDto.iva
          ? new Prisma.Decimal(createProductoDto.iva)
          : new Prisma.Decimal(16),
        disponible: createProductoDto.disponible_venta ?? true,
        es_vendible: createProductoDto.disponible_venta ?? true,
        tiempo_preparacion_min: createProductoDto.tiempo_preparacion_min,
        calorias: createProductoDto.calorias,
        imagen_url: createProductoDto.imagen_url,
        alergenos: createProductoDto.alergenos?.join(','),
      },
      include: {
        categorias: true,
        unidades_medida: true,
      },
    });

    if (createProductoDto.stock_minimo || createProductoDto.stock_maximo) {
      await this.prisma.inventario.create({
        data: {
          id_producto: producto.id_producto,
          stock_actual: new Prisma.Decimal(0),
          stock_minimo: createProductoDto.stock_minimo
            ? new Prisma.Decimal(createProductoDto.stock_minimo)
            : new Prisma.Decimal(0),
          stock_maximo: createProductoDto.stock_maximo
            ? new Prisma.Decimal(createProductoDto.stock_maximo)
            : null,
          ubicacion_almacen: createProductoDto.ubicacion_almacen,
        },
      });
    }

    await this.cache.set(
      this.keyById(producto.id_producto),
      producto,
      this.DEFAULT_TTL,
    );
    await this.invalidateListsAndDerived();
    return producto;
  }

  // ---------- LIST ----------
  async findAll(query: QueryProductosDto) {
    const key = this.keyList(query);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    // ✅ CORRECCIÓN: Convertir page y limit a números explícitamente
    const {
      page: pageParam = 1,
      limit: limitParam = 20,
      search,
      categoria,
      activo,
      disponible,
      ordenarPor = 'nombre',
      orden = 'asc',
    } = query;

    // Asegurar que page y limit sean números
    const page =
      typeof pageParam === 'string' ? parseInt(pageParam, 10) : pageParam;
    const limit =
      typeof limitParam === 'string' ? parseInt(limitParam, 10) : limitParam;

    const skip = (page - 1) * limit;

    const where: Prisma.productosWhereInput = {
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoria && { id_categoria: categoria }),
      ...(disponible !== undefined && { disponible }),
      ...(activo !== undefined && {
        deleted_at: activo ? null : { not: null },
      }),
    };

    const campoOrdenamiento: Record<string, string> = {
      nombre: 'nombre',
      precio: 'precio_venta',
      codigo: 'sku',
      stock: 'nombre',
      createdAt: 'created_at',
    };

    const orderBy: Prisma.productosOrderByWithRelationInput = {
      [campoOrdenamiento[ordenarPor] || 'nombre']: orden as any,
    };

    const [productos, total] = await Promise.all([
      this.prisma.productos.findMany({
        where,
        skip,
        take: limit, // ← Ahora es número garantizado
        orderBy,
        include: {
          categorias: true,
          unidades_medida: true,
          inventario: true,
        },
      }),
      this.prisma.productos.count({ where }),
    ]);

    const result = {
      data: productos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };

    await this.cache.set(key, result, this.DEFAULT_TTL);
    return result;
  }

  async findActivos(query: QueryProductosDto) {
    return this.findAll({
      ...query,
      activo: true,
      disponible: true,
    });
  }

  async search(searchTerm: string) {
    if (!searchTerm || searchTerm.length < 2) return [];

    const key = this.keySearch(searchTerm);
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.productos.findMany({
      where: {
        AND: [
          { disponible: true },
          { es_vendible: true },
          { deleted_at: null },
          {
            OR: [
              { nombre: { contains: searchTerm, mode: 'insensitive' } },
              { sku: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        ],
      },
      take: 10,
      include: {
        categorias: true,
        unidades_medida: true,
      },
    });

    await this.cache.set(key, data, this.SEARCH_TTL);
    return data;
  }

  async findByCategoria(categoriaId: number, query: QueryProductosDto) {
    return this.findAll({ ...query, categoria: categoriaId });
  }

  // ---------- READ ONE ----------
  async findOne(id: number) {
    const key = this.keyById(id);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: id },
      include: {
        categorias: true,
        unidades_medida: true,
        inventario: true,
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    await this.cache.set(key, producto, this.DEFAULT_TTL);
    return producto;
  }

  // ---------- UPDATE ----------
  async update(id: number, updateProductoDto: UpdateProductoDto) {
    await this.findOne(id);

    if (updateProductoDto.codigo) {
      const existingProduct = await this.prisma.productos.findFirst({
        where: {
          sku: updateProductoDto.codigo,
          NOT: { id_producto: id },
        },
      });
      if (existingProduct) {
        throw new ConflictException(
          `El código ${updateProductoDto.codigo} ya está en uso`,
        );
      }
    }

    if (updateProductoDto.id_tipo_producto) {
      const categoria = await this.prisma.categorias.findUnique({
        where: { id_categoria: updateProductoDto.id_tipo_producto },
      });
      if (!categoria) throw new BadRequestException('La categoría no existe');
    }

    if (updateProductoDto.id_unidad_medida) {
      const unidadMedida = await this.prisma.unidades_medida.findUnique({
        where: { id_unidad: updateProductoDto.id_unidad_medida },
      });
      if (!unidadMedida)
        throw new BadRequestException('La unidad de medida no existe');
    }

    const updateData: any = {};
    if (updateProductoDto.codigo !== undefined)
      updateData.sku = updateProductoDto.codigo;
    if (updateProductoDto.nombre !== undefined)
      updateData.nombre = updateProductoDto.nombre;
    if (updateProductoDto.descripcion !== undefined)
      updateData.descripcion = updateProductoDto.descripcion;
    if (updateProductoDto.id_tipo_producto !== undefined)
      updateData.id_categoria = updateProductoDto.id_tipo_producto;
    if (updateProductoDto.id_unidad_medida !== undefined)
      updateData.id_unidad_medida = updateProductoDto.id_unidad_medida;
    if (updateProductoDto.precio_venta !== undefined)
      updateData.precio_venta = new Prisma.Decimal(
        updateProductoDto.precio_venta,
      );
    if (updateProductoDto.costo !== undefined)
      updateData.costo_promedio = new Prisma.Decimal(updateProductoDto.costo);
    if (updateProductoDto.iva !== undefined)
      updateData.iva_tasa = new Prisma.Decimal(updateProductoDto.iva);
    if (updateProductoDto.disponible_venta !== undefined) {
      updateData.disponible = updateProductoDto.disponible_venta;
      updateData.es_vendible = updateProductoDto.disponible_venta;
    }
    if (updateProductoDto.tiempo_preparacion_min !== undefined)
      updateData.tiempo_preparacion_min =
        updateProductoDto.tiempo_preparacion_min;
    if (updateProductoDto.calorias !== undefined)
      updateData.calorias = updateProductoDto.calorias;
    if (updateProductoDto.imagen_url !== undefined)
      updateData.imagen_url = updateProductoDto.imagen_url;
    if (updateProductoDto.alergenos !== undefined)
      updateData.alergenos = updateProductoDto.alergenos.join(',');

    const producto = await this.prisma.productos.update({
      where: { id_producto: id },
      data: updateData,
      include: {
        categorias: true,
        unidades_medida: true,
        inventario: true,
      },
    });

    await this.cache.set(this.keyById(id), producto, this.DEFAULT_TTL);
    await this.invalidateListsAndDerived();
    return producto;
  }

  // ---------- DELETE / SOFT ----------
  async remove(id: number) {
    await this.findOne(id);

    const [movimientos, ordenes] = await Promise.all([
      this.prisma.movimientos_inventario.count({
        where: { id_producto: id },
      }),
      this.prisma.orden_detalle.count({
        where: { id_producto: id },
      }),
    ]);

    if (movimientos > 0 || ordenes > 0) {
      const prod = await this.prisma.productos.update({
        where: { id_producto: id },
        data: {
          deleted_at: new Date(),
          disponible: false,
          es_vendible: false,
        },
      });
      await this.cacheUtil.invalidate({
        keys: [this.keyById(id)],
        patterns: ['productos:list:*', 'productos:search:*'],
      });
      return prod;
    }

    const eliminado = await this.prisma.productos.delete({
      where: { id_producto: id },
    });

    await this.cacheUtil.invalidate({
      keys: [this.keyById(id)],
      patterns: ['productos:list:*', 'productos:search:*'],
    });

    return eliminado;
  }

  async activar(id: number) {
    await this.findOne(id);
    const producto = await this.prisma.productos.update({
      where: { id_producto: id },
      data: { deleted_at: null, disponible: true, es_vendible: true },
      include: { categorias: true, unidades_medida: true, inventario: true },
    });
    await this.cache.set(this.keyById(id), producto, this.DEFAULT_TTL);
    await this.invalidateListsAndDerived();
    return producto;
  }

  async desactivar(id: number) {
    await this.findOne(id);
    const producto = await this.prisma.productos.update({
      where: { id_producto: id },
      data: { disponible: false, es_vendible: false },
      include: { categorias: true, unidades_medida: true, inventario: true },
    });
    await this.cache.set(this.keyById(id), producto, this.DEFAULT_TTL);
    await this.invalidateListsAndDerived();
    return producto;
  }

  async getEstadisticas() {
    const key = this.keyStats();
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const [totalProductos, productosActivos, productosBajoStock, categorias] =
      await Promise.all([
        this.prisma.productos.count(),
        this.prisma.productos.count({
          where: { deleted_at: null, disponible: true },
        }),
        this.prisma.inventario.count({
          where: {
            stock_actual: {
              lte: this.prisma.inventario.fields.stock_minimo as any,
            },
          },
        }),
        this.prisma.categorias.findMany({
          where: { activa: true },
          select: {
            id_categoria: true,
            nombre: true,
            _count: { select: { productos: true } },
          },
        }),
      ]);

    const result = {
      totalProductos,
      productosActivos,
      productosInactivos: totalProductos - productosActivos,
      productosBajoStock,
      productosPorCategoria: categorias.map((cat) => ({
        id: cat.id_categoria,
        nombre: cat.nombre,
        cantidad: cat._count.productos,
      })),
    };

    await this.cache.set(key, result, this.STATS_TTL);
    return result;
  }
}
