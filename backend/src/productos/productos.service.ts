/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Ajusta rutas si cambian en tu proyecto
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { QueryProductosDto } from './dto/query-productos.dto';

@Injectable()
export class ProductosService {
  private readonly DEFAULT_TTL = 900_000; // 15 min en ms

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // ======================
  // Helpers de claves de caché
  // ======================
  private cacheKeyList(query: Partial<QueryProductosDto>) {
    const safe = {
      page: query?.page ?? 1,
      limit: query?.limit ?? 20,
      search: query?.search ?? null,
      categoria: query?.categoria ?? null,
      ordenarPor: query?.ordenarPor ?? 'nombre',
      orden: query?.orden ?? 'asc',
    };
    return `productos:list:${JSON.stringify(safe)}`;
  }

  private cacheKeyById(id: number) {
    return `productos:id:${id}`;
  }

  private async invalidateAllLists() {
    await this.cacheManager.reset();
  }

  // ======================
  // READ: listado con filtros + caché
  // ======================
  async findAll(query: QueryProductosDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoria, // id numérico de categoría (según tu schema)
      ordenarPor = 'nombre',
      orden = 'asc',
    } = query;

    const skip = (page - 1) * limit;
    const listKey = this.cacheKeyList(query);

    const cached = await this.cacheManager.get<{ data: any[]; meta: any }>(
      listKey,
    );
    if (cached) return cached;

    // Filtro Prisma alineado al schema (sin 'activo', sin 'codigo')
    const where: Prisma.productosWhereInput = {
      AND: [
        search
          ? ({
              OR: [
                { nombre: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } as any },
              ],
            } as any)
          : ({} as any),

        // Filtrado por categoría usando el campo directo id_categoria
        categoria != null && categoria !== ('' as any)
          ? ({ id_categoria: Number(categoria) } as any)
          : ({} as any),
      ],
    };

    const [productos, total] = await Promise.all([
      this.prisma.productos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [ordenarPor]: orden } as any,
        include: {
          categorias: true,
          unidades_medida: true,
          inventario: true,
        } as any,
      }),
      this.prisma.productos.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const result = {
      data: productos,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    await this.cacheManager.set(listKey, result, this.DEFAULT_TTL);
    return result;
  }

  // ======================
  // READ: por id con caché
  // ======================
  async findOne(id: number) {
    const key = this.cacheKeyById(id);
    const cached = await this.cacheManager.get<any>(key);
    if (cached) return cached;

    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: id } as any,
      include: {
        categorias: true,
        unidades_medida: true,
        inventario: true,
      } as any,
    });

    if (!producto) throw new NotFoundException('Producto no encontrado');

    await this.cacheManager.set(key, producto, this.DEFAULT_TTL);
    return producto;
  }

  // ======================
  // EXTRA ENDPOINTS que invoca tu controller
  // ======================

  // /productos/activos  -> en tu schema el campo es 'disponible'
  async findActivos(query: QueryProductosDto) {
    const {
      page = 1,
      limit = 20,
      ordenarPor = 'nombre',
      orden = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.productosWhereInput = {
      disponible: true as any, // Boolean? en schema -> compatible
    };

    const [productos, total] = await Promise.all([
      this.prisma.productos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [ordenarPor]: orden } as any,
        include: { categorias: true, unidades_medida: true } as any,
      }),
      this.prisma.productos.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const result = {
      data: productos,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    // Cachea esta lista específica también (opcional)
    const listKey = `productos:list:activos:${JSON.stringify({ page, limit, ordenarPor, orden })}`;
    await this.cacheManager.set(listKey, result, this.DEFAULT_TTL);

    return result;
  }

  // /productos/search/:term
  async search(term: string) {
    if (!term || !term.trim()) return [];
    const productos = await this.prisma.productos.findMany({
      where: {
        OR: [
          { nombre: { contains: term, mode: 'insensitive' } },
          { sku: { contains: term, mode: 'insensitive' } as any },
        ],
      } as any,
      include: {
        categorias: true,
        unidades_medida: true,
        inventario: true,
      } as any,
      take: 50,
    });
    return productos;
  }

  // /productos/categoria/:id
  async findByCategoria(
    idCategoria: number,
    query?: Partial<QueryProductosDto>,
  ) {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: Prisma.productosWhereInput = {
      id_categoria: Number(idCategoria) as any,
    };

    const [items, total] = await Promise.all([
      this.prisma.productos.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: 'asc' } as any,
        include: { categorias: true, unidades_medida: true } as any,
      }),
      this.prisma.productos.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // /productos/estadisticas
  async getEstadisticas() {
    const total = await this.prisma.productos.count();
    const disponibles = await this.prisma.productos.count({
      where: { disponible: true as any },
    });
    return { total, disponibles };
  }

  // /productos/:id/activar  -> usar 'disponible'
  async activar(id: number) {
    const actualizado = await this.prisma.productos.update({
      where: { id_producto: id } as any,
      data: { disponible: true } as any,
    });
    await this.cacheManager.del(this.cacheKeyById(id));
    await this.invalidateAllLists();
    return actualizado;
  }

  // /productos/:id/desactivar -> usar 'disponible'
  async desactivar(id: number) {
    const actualizado = await this.prisma.productos.update({
      where: { id_producto: id } as any,
      data: { disponible: false } as any,
    });
    await this.cacheManager.del(this.cacheKeyById(id));
    await this.invalidateAllLists();
    return actualizado;
  }

  // ======================
  // CREATE
  // ======================
  async create(dto: CreateProductoDto) {
    // Tu schema hace 'sku' único -> valida duplicados
    if ((dto as any)?.sku) {
      const dup = await this.prisma.productos.findUnique({
        where: { sku: (dto as any).sku } as any,
        select: { sku: true } as any,
      });
      if (dup) throw new ConflictException('Ya existe un producto con ese SKU');
    }

    const creado = await this.prisma.productos.create({
      data: dto as any, // mapea tu DTO al modelo (tienes varios requeridos como precio_venta, id_categoria, id_unidad_medida)
    });

    await this.invalidateAllLists();
    const id = (creado as any)?.id_producto ?? (creado as any)?.id;
    if (id)
      await this.cacheManager.set(
        this.cacheKeyById(id),
        creado,
        this.DEFAULT_TTL,
      );

    return creado;
  }

  // ======================
  // UPDATE
  // ======================
  async update(id: number, dto: UpdateProductoDto) {
    const existe = await this.prisma.productos.findUnique({
      where: { id_producto: id } as any,
      select: { id_producto: true } as any,
    });
    if (!existe) throw new NotFoundException('Producto no encontrado');

    const actualizado = await this.prisma.productos.update({
      where: { id_producto: id } as any,
      data: dto as any,
    });

    await this.cacheManager.del(this.cacheKeyById(id));
    await this.invalidateAllLists();

    return actualizado;
  }

  // ======================
  // DELETE
  // ======================
  async remove(id: number) {
    const existe = await this.prisma.productos.findUnique({
      where: { id_producto: id } as any,
      select: { id_producto: true } as any,
    });
    if (!existe) throw new NotFoundException('Producto no encontrado');

    const eliminado = await this.prisma.productos.delete({
      where: { id_producto: id } as any,
    });

    await this.cacheManager.del(this.cacheKeyById(id));
    await this.invalidateAllLists();

    return eliminado;
  }
}
