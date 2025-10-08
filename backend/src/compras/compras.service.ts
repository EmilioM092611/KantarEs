import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { RecepcionarCompraDto } from './dto/recepcionar-compra.dto';
import { CancelCompraDto } from './dto/cancel-compra.dto';
import { FilterCompraDto } from './dto/filter-compra.dto';
import { Prisma, estado_compra } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheUtil } from '../cache/cache-util.service';

@Injectable()
export class ComprasService {
  private readonly DEFAULT_TTL = 900_000; // 15 min
  private readonly STATS_TTL = 120_000; // 2 min

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly cacheUtil: CacheUtil,
  ) {}

  // Keys
  private keyById(id: number) {
    return `compras:id:${id}`;
  }
  private keyList(filters?: FilterCompraDto) {
    const safe = {
      id_proveedor: filters?.id_proveedor ?? null,
      id_usuario_solicita: filters?.id_usuario_solicita ?? null,
      estado: filters?.estado ?? null,
      folio_compra: (filters?.folio_compra ?? '').toLowerCase() || null,
      fecha_desde: filters?.fecha_desde
        ? new Date(filters.fecha_desde).toISOString().slice(0, 10)
        : null,
      fecha_hasta: filters?.fecha_hasta
        ? new Date(filters.fecha_hasta).toISOString().slice(0, 10)
        : null,
    };
    return `compras:list:${JSON.stringify(safe)}`;
  }
  private keyStats(idProveedor?: number) {
    return idProveedor
      ? `compras:stats:prov:${idProveedor}`
      : 'compras:stats:all';
  }

  private async invalidateComprasListsAndStats() {
    await this.cacheUtil.invalidate({
      patterns: ['compras:list:*', 'compras:stats:*'],
    });
  }

  // ... (tu generarFolio y calcularTotalesDetalle se quedan igual)

  private async generarFolio(): Promise<string> {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const fechaStr = `${año}${mes}${dia}`;

    const ultimaCompra = await this.prisma.compras.findFirst({
      where: { folio_compra: { startsWith: `COM-${fechaStr}` } },
      orderBy: { folio_compra: 'desc' },
    });

    let consecutivo = 1;
    if (ultimaCompra) {
      const ultimoConsecutivo = parseInt(
        ultimaCompra.folio_compra.split('-')[2],
        10,
      );
      consecutivo = ultimoConsecutivo + 1;
    }

    return `COM-${fechaStr}-${String(consecutivo).padStart(4, '0')}`;
  }

  private calcularTotalesDetalle(detalle: any) {
    const cantidadPedida = Number(detalle.cantidad_pedida);
    const precioUnitario = Number(detalle.precio_unitario);
    const descuentoPorcentaje = Number(detalle.descuento_porcentaje || 0);
    const descuentoMonto = Number(detalle.descuento_monto || 0);
    const subtotalBruto = cantidadPedida * precioUnitario;
    const descuentoPorPorcentaje = (subtotalBruto * descuentoPorcentaje) / 100;
    const descuentoTotal = descuentoPorPorcentaje + descuentoMonto;
    const subtotal = subtotalBruto - descuentoTotal;
    const ivaMonto = subtotal * 0.16;
    const iepsMonto = 0;
    const total = subtotal + ivaMonto + iepsMonto;

    return {
      subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
      iva_monto: new Prisma.Decimal(ivaMonto.toFixed(2)),
      ieps_monto: new Prisma.Decimal(iepsMonto.toFixed(2)),
      total: new Prisma.Decimal(total.toFixed(2)),
      descuento_porcentaje: new Prisma.Decimal(descuentoPorcentaje),
      descuento_monto: new Prisma.Decimal(descuentoMonto),
    };
  }

  async create(createCompraDto: CreateCompraDto) {
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id_proveedor: createCompraDto.id_proveedor },
    });
    if (!proveedor)
      throw new NotFoundException(
        `Proveedor con ID ${createCompraDto.id_proveedor} no encontrado`,
      );
    if (!proveedor.activo)
      throw new BadRequestException('El proveedor no está activo');

    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: createCompraDto.id_usuario_solicita },
    });
    if (!usuario)
      throw new NotFoundException(
        `Usuario con ID ${createCompraDto.id_usuario_solicita} no encontrado`,
      );

    const folio = await this.generarFolio();

    let subtotalCompra = 0;
    let ivaTotalCompra = 0;
    let iepsTotalCompra = 0;
    let totalCompra = 0;

    const detalleConTotales = createCompraDto.detalle.map((item) => {
      const totales = this.calcularTotalesDetalle(item);
      subtotalCompra += Number(totales.subtotal);
      ivaTotalCompra += Number(totales.iva_monto);
      iepsTotalCompra += Number(totales.ieps_monto);
      totalCompra += Number(totales.total);

      return {
        id_producto: item.id_producto,
        cantidad_pedida: new Prisma.Decimal(item.cantidad_pedida),
        cantidad_recibida: item.cantidad_recibida
          ? new Prisma.Decimal(item.cantidad_recibida)
          : new Prisma.Decimal(0),
        id_unidad_medida: item.id_unidad_medida,
        precio_unitario: new Prisma.Decimal(item.precio_unitario),
        ...totales,
        lote: item.lote,
        fecha_caducidad: item.fecha_caducidad
          ? new Date(item.fecha_caducidad)
          : null,
        observaciones: item.observaciones,
      };
    });

    try {
      const compra = await this.prisma.compras.create({
        data: {
          folio_compra: folio,
          id_proveedor: createCompraDto.id_proveedor,
          id_usuario_solicita: createCompraDto.id_usuario_solicita,
          fecha_pedido: new Date(createCompraDto.fecha_pedido),
          subtotal: new Prisma.Decimal(subtotalCompra.toFixed(2)),
          iva_monto: new Prisma.Decimal(ivaTotalCompra.toFixed(2)),
          ieps_monto: new Prisma.Decimal(iepsTotalCompra.toFixed(2)),
          total: new Prisma.Decimal(totalCompra.toFixed(2)),
          estado: estado_compra.pendiente,
          observaciones: createCompraDto.observaciones,
          compra_detalle: { create: detalleConTotales },
        },
        include: {
          proveedores: {
            select: { razon_social: true, nombre_comercial: true },
          },
          usuarios_compras_id_usuario_solicitaTousuarios: {
            select: {
              username: true,
              personas: { select: { nombre: true, apellido_paterno: true } },
            },
          },
          compra_detalle: {
            include: {
              productos: { select: { sku: true, nombre: true } },
              unidades_medida: { select: { nombre: true, abreviatura: true } },
            },
          },
        },
      });

      await this.cache.set(
        this.keyById(compra.id_compra),
        compra,
        this.DEFAULT_TTL,
      );
      await this.invalidateComprasListsAndStats();
      return compra;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una compra con ese folio');
      }
      throw error;
    }
  }

  async findAll(filters?: FilterCompraDto) {
    const listKey = this.keyList(filters);
    const cached = await this.cache.get<any[]>(listKey);
    if (cached) return cached;

    const where: Prisma.comprasWhereInput = {};
    if (filters?.id_proveedor) where.id_proveedor = filters.id_proveedor;
    if (filters?.id_usuario_solicita)
      where.id_usuario_solicita = filters.id_usuario_solicita;
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.folio_compra) {
      where.folio_compra = {
        contains: filters.folio_compra,
        mode: 'insensitive',
      };
    }
    if (filters?.fecha_desde || filters?.fecha_hasta) {
      where.fecha_pedido = {};
      if (filters.fecha_desde)
        where.fecha_pedido.gte = new Date(filters.fecha_desde);
      if (filters.fecha_hasta) {
        const fh = new Date(filters.fecha_hasta);
        fh.setHours(23, 59, 59, 999);
        where.fecha_pedido.lte = fh;
      }
    }

    const data = await this.prisma.compras.findMany({
      where,
      include: {
        proveedores: { select: { razon_social: true, nombre_comercial: true } },
        usuarios_compras_id_usuario_solicitaTousuarios: {
          select: {
            username: true,
            personas: { select: { nombre: true, apellido_paterno: true } },
          },
        },
        usuarios_compras_id_usuario_autorizaTousuarios: {
          select: { username: true },
        },
        _count: { select: { compra_detalle: true } },
      },
      orderBy: { fecha_pedido: 'desc' },
    });

    await this.cache.set(listKey, data, this.DEFAULT_TTL);
    return data;
  }

  async findOne(id: number) {
    const key = this.keyById(id);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const compra = await this.prisma.compras.findUnique({
      where: { id_compra: id },
      include: {
        proveedores: true,
        usuarios_compras_id_usuario_solicitaTousuarios: {
          select: { username: true, personas: true },
        },
        usuarios_compras_id_usuario_autorizaTousuarios: {
          select: { username: true, personas: true },
        },
        compra_detalle: {
          include: {
            productos: {
              select: { sku: true, nombre: true, imagen_url: true },
            },
            unidades_medida: { select: { nombre: true, abreviatura: true } },
          },
        },
      },
    });

    if (!compra)
      throw new NotFoundException(`Compra con ID ${id} no encontrada`);

    await this.cache.set(key, compra, this.DEFAULT_TTL);
    return compra;
  }

  async update(id: number, updateCompraDto: UpdateCompraDto) {
    const compra = await this.findOne(id);
    if (compra.estado !== estado_compra.pendiente) {
      throw new BadRequestException('Solo se pueden editar compras pendientes');
    }

    const updated = await this.prisma.compras.update({
      where: { id_compra: id },
      data: {
        id_proveedor: updateCompraDto.id_proveedor,
        fecha_pedido: updateCompraDto.fecha_pedido
          ? new Date(updateCompraDto.fecha_pedido)
          : undefined,
        observaciones: updateCompraDto.observaciones,
      },
      include: {
        proveedores: true,
        compra_detalle: { include: { productos: true } },
      },
    });

    await this.cacheUtil.invalidate({
      keys: [this.keyById(id)],
      patterns: ['compras:list:*', 'compras:stats:*'],
    });

    return updated;
  }

  async autorizar(id: number, idUsuarioAutoriza: number) {
    const compra = await this.findOne(id);
    if (compra.estado !== estado_compra.pendiente) {
      throw new BadRequestException(
        'Solo se pueden autorizar compras pendientes',
      );
    }

    const updated = await this.prisma.compras.update({
      where: { id_compra: id },
      data: {
        estado: estado_compra.autorizada,
        id_usuario_autoriza: idUsuarioAutoriza,
      },
    });

    await this.cacheUtil.invalidate({
      keys: [this.keyById(id)],
      patterns: ['compras:list:*', 'compras:stats:*'],
    });

    return updated;
  }

  async recepcionar(id: number, recepcionarCompraDto: RecepcionarCompraDto) {
    const compra = await this.findOne(id);

    if (compra.estado === estado_compra.recibida) {
      throw new BadRequestException('La compra ya fue recibida');
    }
    if (compra.estado === estado_compra.cancelada) {
      throw new BadRequestException(
        'No se puede recepcionar una compra cancelada',
      );
    }

    for (const item of recepcionarCompraDto.items) {
      await this.prisma.compra_detalle.update({
        where: { id_detalle: item.id_detalle },
        data: { cantidad_recibida: new Prisma.Decimal(item.cantidad_recibida) },
      });
    }

    const updated = await this.prisma.compras.update({
      where: { id_compra: id },
      data: {
        estado: estado_compra.recibida,
        id_usuario_autoriza: recepcionarCompraDto.id_usuario_autoriza,
        fecha_recepcion: new Date(recepcionarCompraDto.fecha_recepcion),
        numero_factura: recepcionarCompraDto.numero_factura,
        observaciones:
          recepcionarCompraDto.observaciones || compra.observaciones,
      },
      include: { compra_detalle: { include: { productos: true } } },
    });

    await this.cacheUtil.invalidate({
      keys: [this.keyById(id)],
      patterns: ['compras:list:*', 'compras:stats:*'],
    });

    return updated;
  }

  async cancel(id: number, cancelCompraDto: CancelCompraDto) {
    const compra = await this.findOne(id);
    if (compra.estado === estado_compra.cancelada) {
      throw new BadRequestException('La compra ya está cancelada');
    }
    if (compra.estado === estado_compra.recibida) {
      throw new BadRequestException(
        'No se puede cancelar una compra ya recibida',
      );
    }

    const updated = await this.prisma.compras.update({
      where: { id_compra: id },
      data: {
        estado: estado_compra.cancelada,
        observaciones: cancelCompraDto.observaciones,
      },
    });

    await this.cacheUtil.invalidate({
      keys: [this.keyById(id)],
      patterns: ['compras:list:*', 'compras:stats:*'],
    });

    return updated;
  }

  async getEstadisticas(idProveedor?: number) {
    const key = this.keyStats(idProveedor);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const where: Prisma.comprasWhereInput = idProveedor
      ? { id_proveedor: idProveedor }
      : {};

    const [total, pendientes, autorizadas, recibidas, canceladas] =
      await Promise.all([
        this.prisma.compras.count({ where }),
        this.prisma.compras.count({
          where: { ...where, estado: estado_compra.pendiente },
        }),
        this.prisma.compras.count({
          where: { ...where, estado: estado_compra.autorizada },
        }),
        this.prisma.compras.count({
          where: { ...where, estado: estado_compra.recibida },
        }),
        this.prisma.compras.count({
          where: { ...where, estado: estado_compra.cancelada },
        }),
      ]);

    const valorTotal = await this.prisma.compras.aggregate({
      where: { ...where, estado: estado_compra.recibida },
      _sum: { total: true },
    });

    const result = {
      total_compras: total,
      pendientes,
      autorizadas,
      recibidas,
      canceladas,
      valor_total_recibido: Number(valorTotal._sum.total || 0).toFixed(2),
    };

    await this.cache.set(key, result, this.STATS_TTL);
    return result;
  }
}
