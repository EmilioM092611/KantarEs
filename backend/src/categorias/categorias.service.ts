/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheUtil } from '../cache/cache-util.service';

@Injectable()
export class CategoriasService {
  private readonly DEFAULT_TTL = 1_800_000; // 30 min

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly cacheUtil: CacheUtil,
  ) {}

  // Keys
  private keyList(activo?: boolean) {
    return `categorias:list:${activo === undefined ? 'all' : `activo:${activo}`}`;
  }
  private keyWithCount() {
    return 'categorias:list:with-count';
  }
  private keyMenu() {
    return 'categorias:menu';
  }
  private keyById(id: number) {
    return `categorias:id:${id}`;
  }
  private keyProductosByCat(id: number) {
    return `categorias:${id}:productos`;
  }
  private async invalidateAllCategorias() {
    await this.cacheUtil.invalidate({
      patterns: ['categorias:list:*', 'categorias:*:productos'],
      keys: [this.keyMenu()],
    });
  }

  async create(createCategoriaDto: CreateCategoriaDto) {
    const existing = await this.prisma.categorias.findFirst({
      where: {
        nombre: { equals: createCategoriaDto.nombre, mode: 'insensitive' },
      },
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe una categoría con el nombre ${createCategoriaDto.nombre}`,
      );
    }

    if (createCategoriaDto.orden_menu === undefined) {
      const maxOrden = await this.prisma.categorias.aggregate({
        _max: { orden_visualizacion: true },
      });
      createCategoriaDto.orden_menu =
        (maxOrden._max.orden_visualizacion || 0) + 1;
    }

    const created = await this.prisma.categorias.create({
      data: {
        nombre: createCategoriaDto.nombre,
        descripcion: createCategoriaDto.descripcion,
        orden_visualizacion: createCategoriaDto.orden_menu,
        visible_menu: true,
        activa: createCategoriaDto.activo ?? true,
        id_tipo_producto: createCategoriaDto.requiere_preparacion ? 1 : null,
      },
    });

    await this.cache.set(
      this.keyById(created.id_categoria),
      created,
      this.DEFAULT_TTL,
    );
    await this.invalidateAllCategorias();
    return created;
  }

  async findAll(activo?: boolean) {
    const key = this.keyList(activo);
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.categorias.findMany({
      where: activo !== undefined ? { activa: activo } : undefined,
      orderBy: [{ orden_visualizacion: 'asc' }, { nombre: 'asc' }],
    });

    await this.cache.set(key, data, this.DEFAULT_TTL);
    return data;
  }

  async findAllWithProductCount() {
    const key = this.keyWithCount();
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.categorias.findMany({
      orderBy: [{ orden_visualizacion: 'asc' }, { nombre: 'asc' }],
      include: { _count: { select: { productos: true } } },
    });

    await this.cache.set(key, data, this.DEFAULT_TTL);
    return data;
  }

  async getCategoriasMenu() {
    const key = this.keyMenu();
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.categorias.findMany({
      where: {
        activa: true,
        visible_menu: true,
        productos: {
          some: { disponible: true, es_vendible: true, deleted_at: null },
        },
      },
      orderBy: [{ orden_visualizacion: 'asc' }, { nombre: 'asc' }],
      include: {
        productos: {
          where: { disponible: true, es_vendible: true, deleted_at: null },
          orderBy: { nombre: 'asc' },
        },
      },
    });

    await this.cache.set(key, data, this.DEFAULT_TTL);
    return data;
  }

  async findOne(id: number) {
    const key = this.keyById(id);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const categoria = await this.prisma.categorias.findUnique({
      where: { id_categoria: id },
      include: { _count: { select: { productos: true } } },
    });

    if (!categoria)
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);

    await this.cache.set(key, categoria, this.DEFAULT_TTL);
    return categoria;
  }

  async getProductosByCategoria(id: number) {
    await this.findOne(id);
    const key = this.keyProductosByCat(id);
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.productos.findMany({
      where: { id_categoria: id, deleted_at: null },
      orderBy: { nombre: 'asc' },
      include: { unidades_medida: true, inventario: true },
    });

    await this.cache.set(key, data, this.DEFAULT_TTL);
    return data;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    await this.findOne(id);

    if (updateCategoriaDto.nombre) {
      const existing = await this.prisma.categorias.findFirst({
        where: {
          nombre: { equals: updateCategoriaDto.nombre, mode: 'insensitive' },
          NOT: { id_categoria: id },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Ya existe una categoría con el nombre ${updateCategoriaDto.nombre}`,
        );
      }
    }

    const updateData: any = {};
    if (updateCategoriaDto.nombre !== undefined)
      updateData.nombre = updateCategoriaDto.nombre;
    if (updateCategoriaDto.descripcion !== undefined)
      updateData.descripcion = updateCategoriaDto.descripcion;
    if (updateCategoriaDto.orden_menu !== undefined)
      updateData.orden_visualizacion = updateCategoriaDto.orden_menu;
    if (updateCategoriaDto.activo !== undefined)
      updateData.activa = updateCategoriaDto.activo;
    if (updateCategoriaDto.icono !== undefined)
      updateData.imagen_url = updateCategoriaDto.icono;

    const updated = await this.prisma.categorias.update({
      where: { id_categoria: id },
      data: updateData,
    });

    await this.cache.set(this.keyById(id), updated, this.DEFAULT_TTL);
    await this.invalidateAllCategorias();
    return updated;
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);

    const productosCount = await this.prisma.productos.count({
      where: { id_categoria: id, deleted_at: null },
    });

    if (productosCount > 0) {
      const updated = await this.prisma.categorias.update({
        where: { id_categoria: id },
        data: { activa: false },
      });
      await this.cache.set(this.keyById(id), updated, this.DEFAULT_TTL);
      await this.invalidateAllCategorias();
      return updated;
    }

    const eliminado = await this.prisma.categorias.delete({
      where: { id_categoria: id },
    });

    await this.cacheUtil.invalidate({
      keys: [this.keyById(id)],
      patterns: ['categorias:list:*', 'categorias:*:productos'],
    });

    return eliminado;
  }

  async activar(id: number) {
    await this.findOne(id);

    const updated = await this.prisma.categorias.update({
      where: { id_categoria: id },
      data: { activa: true, visible_menu: true },
    });

    await this.cache.set(this.keyById(id), updated, this.DEFAULT_TTL);
    await this.invalidateAllCategorias();
    return updated;
  }

  async desactivar(id: number) {
    await this.findOne(id);

    await this.prisma.productos.updateMany({
      where: { id_categoria: id },
      data: { disponible: false, es_vendible: false },
    });

    const updated = await this.prisma.categorias.update({
      where: { id_categoria: id },
      data: { activa: false, visible_menu: false },
    });

    await this.cache.set(this.keyById(id), updated, this.DEFAULT_TTL);
    await this.invalidateAllCategorias();
    return updated;
  }

  async reordenarCategorias(categorias: { id: number; orden: number }[]) {
    const updates = categorias.map((cat) =>
      this.prisma.categorias.update({
        where: { id_categoria: cat.id },
        data: { orden_visualizacion: cat.orden },
      }),
    );
    await this.prisma.$transaction(updates);
    await this.invalidateAllCategorias();
  }
}
