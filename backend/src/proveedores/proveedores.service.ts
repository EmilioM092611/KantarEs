/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { FilterProveedorDto } from './dto/filter-proveedor.dto';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheUtil } from '../cache/cache-util.service';
import { EvaluarProveedorDto } from '../compras/dto/evaluar-proveedor.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProveedoresService {
  private readonly DEFAULT_TTL = 1_800_000; // 30 min
  private readonly SHORT_TTL = 120_000; // 2 min

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly cacheUtil: CacheUtil,
  ) {}

  // Keys
  private keyList(filters: Partial<FilterProveedorDto>) {
    const safe = {
      search: filters?.search ?? null,
      activo: filters?.activo ?? null,
      ciudad: filters?.ciudad ?? null,
      estado: filters?.estado ?? null,
      calificacion_min: filters?.calificacion_min ?? null,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 10,
      sortBy: filters?.sortBy ?? 'razon_social',
      sortOrder: filters?.sortOrder ?? 'asc',
    };
    return `proveedores:list:${JSON.stringify(safe)}`;
  }
  private keyById(id: number) {
    return `proveedores:id:${id}`;
  }
  private keyByRfc(rfc: string) {
    return `proveedores:rfc:${(rfc ?? '').toLowerCase()}`;
  }
  private keyActivos() {
    return 'proveedores:list:activos';
  }
  private keyHistorial(id: number) {
    return `proveedores:${id}:historial-compras`;
  }
  private keyStats(id: number) {
    return `proveedores:${id}:estadisticas`;
  }

  private async invalidateProveedorLists() {
    await this.cacheUtil.invalidate({
      patterns: ['proveedores:list:*'],
    });
  }
  private async invalidateProveedorDerived(id: number) {
    await this.cacheUtil.invalidate({
      keys: [this.keyActivos(), this.keyHistorial(id), this.keyStats(id)],
    });
  }

  async create(createProveedorDto: CreateProveedorDto) {
    const rfcExists = await this.prisma.proveedores.findUnique({
      where: { rfc: createProveedorDto.rfc },
    });
    if (rfcExists) {
      throw new ConflictException(
        `Ya existe un proveedor con el RFC: ${createProveedorDto.rfc}`,
      );
    }

    try {
      const proveedor = await this.prisma.proveedores.create({
        data: createProveedorDto,
      });

      await this.cache.set(
        this.keyById(proveedor.id_proveedor),
        proveedor,
        this.DEFAULT_TTL,
      );
      if (proveedor.rfc) {
        await this.cache.set(
          this.keyByRfc(proveedor.rfc),
          proveedor,
          this.DEFAULT_TTL,
        );
      }
      await this.invalidateProveedorLists();
      return proveedor;
    } catch (error) {
      throw new BadRequestException('Error al crear el proveedor');
    }
  }

  async findAll(filters: FilterProveedorDto) {
    const listKey = this.keyList(filters);
    const cached = await this.cache.get<{ data: any[]; meta: any }>(listKey);
    if (cached) return cached;

    const {
      search,
      activo,
      ciudad,
      estado,
      calificacion_min,
      page = 1,
      limit = 10,
      sortBy = 'razon_social',
      sortOrder = 'asc',
    } = filters;

    const where: Prisma.proveedoresWhereInput = {
      AND: [
        activo !== undefined ? { activo } : {},
        ciudad ? { ciudad: { contains: ciudad, mode: 'insensitive' } } : {},
        estado ? { estado: { contains: estado, mode: 'insensitive' } } : {},
        calificacion_min ? { calificacion: { gte: calificacion_min } } : {},
        search
          ? {
              OR: [
                { razon_social: { contains: search, mode: 'insensitive' } },
                { nombre_comercial: { contains: search, mode: 'insensitive' } },
                { rfc: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.proveedores.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder } as any,
      }),
      this.prisma.proveedores.count({ where }),
    ]);

    const result = {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    await this.cache.set(listKey, result, this.DEFAULT_TTL);
    return result;
  }

  async findOne(id: number) {
    const key = this.keyById(id);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id_proveedor: id },
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    await this.cache.set(key, proveedor, this.DEFAULT_TTL);
    if (proveedor.rfc) {
      await this.cache.set(
        this.keyByRfc(proveedor.rfc),
        proveedor,
        this.DEFAULT_TTL,
      );
    }

    return proveedor;
  }

  async findByRfc(rfc: string) {
    const key = this.keyByRfc(rfc);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const proveedor = await this.prisma.proveedores.findUnique({
      where: { rfc },
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con RFC ${rfc} no encontrado`);
    }

    await this.cache.set(key, proveedor, this.DEFAULT_TTL);
    await this.cache.set(
      this.keyById(proveedor.id_proveedor),
      proveedor,
      this.DEFAULT_TTL,
    );

    return proveedor;
  }

  async update(id: number, updateProveedorDto: UpdateProveedorDto) {
    const prev = await this.findOne(id);

    if (updateProveedorDto.rfc) {
      const rfcExists = await this.prisma.proveedores.findFirst({
        where: { rfc: updateProveedorDto.rfc, NOT: { id_proveedor: id } },
      });
      if (rfcExists) {
        throw new ConflictException(
          `Ya existe otro proveedor con el RFC: ${updateProveedorDto.rfc}`,
        );
      }
    }

    try {
      const proveedor = await this.prisma.proveedores.update({
        where: { id_proveedor: id },
        data: updateProveedorDto,
      });

      await this.cache.set(this.keyById(id), proveedor, this.DEFAULT_TTL);
      if (proveedor.rfc) {
        await this.cache.set(
          this.keyByRfc(proveedor.rfc),
          proveedor,
          this.DEFAULT_TTL,
        );
      }
      if (prev?.rfc && prev.rfc !== proveedor.rfc) {
        await this.cache.del(this.keyByRfc(prev.rfc));
      }

      await this.invalidateProveedorLists();
      await this.invalidateProveedorDerived(id);
      return proveedor;
    } catch (error) {
      throw new BadRequestException('Error al actualizar el proveedor');
    }
  }

  async remove(id: number) {
    const proveedor = await this.findOne(id);

    const comprasCount = await this.prisma.compras.count({
      where: { id_proveedor: id },
    });
    if (comprasCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el proveedor porque tiene ${comprasCount} compra(s) asociada(s). Considere desactivarlo en su lugar.`,
      );
    }

    try {
      const eliminado = await this.prisma.proveedores.delete({
        where: { id_proveedor: id },
      });

      await this.cacheUtil.invalidate({
        keys: [
          this.keyById(id),
          ...(proveedor?.rfc ? [this.keyByRfc(proveedor.rfc)] : []),
        ],
        patterns: ['proveedores:list:*'],
      });
      await this.invalidateProveedorDerived(id);

      return eliminado;
    } catch (error) {
      throw new BadRequestException('Error al eliminar el proveedor');
    }
  }

  async toggleActive(id: number) {
    const proveedor = await this.findOne(id);

    const actualizado = await this.prisma.proveedores.update({
      where: { id_proveedor: id },
      data: { activo: !proveedor.activo },
    });

    await this.cache.set(this.keyById(id), actualizado, this.DEFAULT_TTL);
    if (actualizado.rfc) {
      await this.cache.set(
        this.keyByRfc(actualizado.rfc),
        actualizado,
        this.DEFAULT_TTL,
      );
    }
    await this.invalidateProveedorLists();
    await this.invalidateProveedorDerived(id);

    return actualizado;
  }

  async getHistorialCompras(id: number) {
    await this.findOne(id);

    const key = this.keyHistorial(id);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const compras = await this.prisma.compras.findMany({
      where: { id_proveedor: id },
      include: {
        usuarios_compras_id_usuario_solicitaTousuarios: {
          select: {
            username: true,
            personas: {
              select: { nombre: true, apellido_paterno: true },
            },
          },
        },
      },
      orderBy: { fecha_pedido: 'desc' },
    });

    const totalCompras = compras.length;
    const totalGastado = compras.reduce(
      (sum, compra) => sum + Number(compra.total || 0),
      0,
    );
    const ultimaCompra = compras[0] || null;

    const result = {
      proveedor_id: id,
      total_compras: totalCompras,
      total_gastado: totalGastado,
      ultima_compra: ultimaCompra?.fecha_pedido || null,
      compras,
    };

    await this.cache.set(key, result, this.SHORT_TTL);
    return result;
  }

  async getEstadisticas(id: number) {
    await this.findOne(id);

    const key = this.keyStats(id);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const compras = await this.prisma.compras.findMany({
      where: { id_proveedor: id },
      select: { total: true, estado: true, fecha_pedido: true },
    });

    const estadisticas = {
      total_compras: compras.length,
      compras_por_estado: {
        pendiente: compras.filter((c) => c.estado === 'pendiente').length,
        autorizada: compras.filter((c) => c.estado === 'autorizada').length,
        recibida: compras.filter((c) => c.estado === 'recibida').length,
        cancelada: compras.filter((c) => c.estado === 'cancelada').length,
      },
      monto_total: compras.reduce((sum, c) => sum + Number(c.total || 0), 0),
      promedio_compra:
        compras.length > 0
          ? compras.reduce((sum, c) => sum + Number(c.total || 0), 0) /
            compras.length
          : 0,
    };

    await this.cache.set(key, estadisticas, this.SHORT_TTL);
    return estadisticas;
  }

  async getProveedoresActivos() {
    const key = this.keyActivos();
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.proveedores.findMany({
      where: { activo: true },
      orderBy: { razon_social: 'asc' },
      select: {
        id_proveedor: true,
        razon_social: true,
        nombre_comercial: true,
        rfc: true,
        telefono: true,
        email: true,
      },
    });

    await this.cache.set(key, data, this.DEFAULT_TTL);
    return data;
  }
  async evaluarProveedor(dto: EvaluarProveedorDto): Promise<any> {
    // Calcular calificación global
    const calificacionGlobal =
      (dto.calidad_productos +
        dto.tiempo_entrega +
        dto.atencion_cliente +
        dto.precios_competitivos +
        dto.comunicacion) /
      5;

    // Crear evaluación
    const evaluacion = await this.prisma.proveedor_evaluaciones.create({
      data: {
        id_proveedor: dto.id_proveedor,
        id_usuario_evalua: dto.id_usuario_evalua,
        id_compra: dto.id_compra,
        calificacion_global: calificacionGlobal,
        calidad_productos: dto.calidad_productos,
        tiempo_entrega: dto.tiempo_entrega,
        atencion_cliente: dto.atencion_cliente,
        precios_competitivos: dto.precios_competitivos,
        comunicacion: dto.comunicacion,
        comentarios: dto.comentarios,
      },
    });

    // Actualizar calificación promedio del proveedor
    await this.actualizarCalificacionProveedor(dto.id_proveedor);

    return evaluacion;
  }

  private async actualizarCalificacionProveedor(
    idProveedor: number,
  ): Promise<void> {
    const evaluaciones = await this.prisma.proveedor_evaluaciones.aggregate({
      where: { id_proveedor: idProveedor },
      _avg: { calificacion_global: true },
    });

    if (evaluaciones._avg.calificacion_global) {
      await this.prisma.proveedores.update({
        where: { id_proveedor: idProveedor },
        data: {
          calificacion: evaluaciones._avg.calificacion_global
            ? Math.round(Number(evaluaciones._avg.calificacion_global))
            : null,
        },
      });
    }
  }

  async getEvaluacionesProveedor(
    idProveedor: number,
    limite?: number,
  ): Promise<any> {
    return this.prisma.proveedor_evaluaciones.findMany({
      where: { id_proveedor: idProveedor },
      include: {
        usuarios: {
          select: { username: true, personas: true },
        },
        compras: {
          select: { folio_compra: true, fecha_pedido: true },
        },
      },
      orderBy: { fecha_evaluacion: 'desc' },
      take: limite || 20,
    });
  }

  async getReporteDesempenoProveedor(idProveedor: number): Promise<any> {
    const evaluaciones = await this.getEvaluacionesProveedor(idProveedor, 100);

    if (evaluaciones.length === 0) {
      return {
        mensaje: 'No hay evaluaciones disponibles',
      };
    }

    // Calcular promedios por aspecto
    const promedios = {
      calidad_productos: 0,
      tiempo_entrega: 0,
      atencion_cliente: 0,
      precios_competitivos: 0,
      comunicacion: 0,
    };

    evaluaciones.forEach((ev: any) => {
      promedios.calidad_productos += ev.calidad_productos;
      promedios.tiempo_entrega += ev.tiempo_entrega;
      promedios.atencion_cliente += ev.atencion_cliente;
      promedios.precios_competitivos += ev.precios_competitivos;
      promedios.comunicacion += ev.comunicacion;
    });

    const total = evaluaciones.length;
    Object.keys(promedios).forEach((key) => {
      promedios[key] = Math.round((promedios[key] / total) * 10) / 10;
    });

    // Identificar fortalezas y áreas de mejora
    const aspectos = Object.entries(promedios);
    aspectos.sort((a, b) => b[1] - a[1]);

    return {
      total_evaluaciones: total,
      calificacion_global: evaluaciones[0]?.proveedores?.calificacion || 0,
      promedios_por_aspecto: promedios,
      fortalezas: aspectos.slice(0, 2).map((a) => ({
        aspecto: a[0],
        calificacion: a[1],
      })),
      areas_mejora: aspectos.slice(-2).map((a) => ({
        aspecto: a[0],
        calificacion: a[1],
      })),
      evaluaciones_recientes: evaluaciones.slice(0, 5),
    };
  }
}
