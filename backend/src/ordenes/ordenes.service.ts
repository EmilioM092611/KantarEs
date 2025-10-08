/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// ============== ordenes.service.ts ==============
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdenDto, CreateOrdenItemDto } from './dto/create-orden.dto'; // CORREGIDO: Importar ambos
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CambiarEstadoOrdenDto } from './dto/cambiar-estado-orden.dto';
import { CambiarEstadoItemDto } from './dto/cambiar-estado-item.dto';
import { AplicarDescuentoDto } from './dto/aplicar-descuento.dto';
import { AplicarPropinaDto } from './dto/aplicar-propina.dto';
import { DividirCuentaDto } from './dto/dividir-cuenta.dto';
import { QueryOrdenesDto } from './dto/query-ordenes.dto';
import { AddMultipleItemsDto } from './dto/add-multiple-items.dto';
import {
  CalculoTotales,
  ItemCalculado,
  decimalToNumber,
} from './types/orden.types';
import { estado_orden_detalle, Prisma } from '@prisma/client';

// ==== Cache ====
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheUtil } from '../cache/cache-util.service';

@Injectable()
export class OrdenesService {
  private readonly logger = new Logger(OrdenesService.name);

  // TTLs
  private readonly LIST_TTL = 60_000; // 60s para listados con filtros
  private readonly DETAIL_TTL = 90_000; // 90s para detalle por id
  private readonly BOARD_TTL = 20_000; // 20s para vistas "tablero" (cocina/pendientes/items por servir)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly cacheUtil: CacheUtil,
  ) {}

  // ===== Helpers de claves =====
  private keyById(id: number) {
    return `ordenes:id:${id}`;
  }
  private keyList(q: QueryOrdenesDto) {
    const safe = {
      id_sesion_mesa: q?.id_sesion_mesa ?? null,
      id_usuario_mesero: q?.id_usuario_mesero ?? null,
      id_estado_orden: q?.id_estado_orden ?? null,
      id_mesa: q?.id_mesa ?? null,
      para_llevar: q?.para_llevar ?? null,
      folio: q?.folio ? String(q.folio).toLowerCase() : null,
      fecha_desde: q?.fecha_desde
        ? new Date(q.fecha_desde).toISOString()
        : null,
      fecha_hasta: q?.fecha_hasta
        ? new Date(q.fecha_hasta).toISOString()
        : null,
      limit: q?.limit ?? 50,
      offset: q?.offset ?? 0,
    };
    return `ordenes:list:${JSON.stringify(safe)}`;
  }
  private keySesion(sesionId: number) {
    return `ordenes:sesion:${sesionId}`;
  }
  private keyMesaActiva(mesaId: number) {
    return `ordenes:mesa-activa:${mesaId}`;
  }
  private keyCocina() {
    return `ordenes:cocina`;
  }
  private keyPendientesPago() {
    return `ordenes:pendientes-pago`;
  }
  private keyItemsPorServir() {
    return `ordenes:items-por-servir`;
  }

  private async invalidateListsAndBoards() {
    await this.cacheUtil.invalidate({
      patterns: [
        'ordenes:list:*',
        'ordenes:cocina',
        'ordenes:pendientes-pago',
        'ordenes:items-por-servir',
      ],
    });
  }

  private async invalidatePerOrdenContext(opts: {
    idOrden?: number;
    idSesion?: number;
    idMesa?: number;
  }) {
    const keys: string[] = [];
    const patterns: string[] = ['ordenes:list:*'];

    if (opts.idOrden) keys.push(this.keyById(opts.idOrden));
    if (opts.idSesion) keys.push(this.keySesion(opts.idSesion));
    if (opts.idMesa) keys.push(this.keyMesaActiva(opts.idMesa));

    // Vistas de tablero
    keys.push(
      this.keyCocina(),
      this.keyPendientesPago(),
      this.keyItemsPorServir(),
    );

    await this.cacheUtil.invalidate({ keys, patterns });
  }

  // ========== CREAR ORDEN ==========
  // ========== CREAR ORDEN ==========
  async create(createOrdenDto: CreateOrdenDto, userId: number) {
    // Verificar que la sesión existe y está abierta
    const sesion = await this.prisma.sesiones_mesa.findFirst({
      where: {
        id_sesion: createOrdenDto.id_sesion_mesa,
        estado: 'abierta',
      },
      include: { mesas: true },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión de mesa no encontrada o cerrada');
    }

    // Generar folio único
    const folio = await this.generarFolio();

    // Obtener el estado inicial (pendiente)
    const estadoInicial = await this.prisma.estados_orden.findFirst({
      where: { nombre: 'pendiente' },
    });
    if (!estadoInicial) {
      throw new BadRequestException('Estado inicial no configurado');
    }

    // Crear la orden con transacción
    const created = await this.prisma.$transaction(async (tx) => {
      // Crear orden principal
      const orden = await tx.ordenes.create({
        data: {
          folio,
          id_sesion_mesa: createOrdenDto.id_sesion_mesa,
          id_usuario_mesero: userId,
          id_estado_orden: estadoInicial.id_estado_orden,
          fecha_hora_orden: new Date(),
          observaciones: createOrdenDto.observaciones,
          para_llevar: createOrdenDto.para_llevar || false,
          subtotal: 0,
          descuento_porcentaje: 0,
          descuento_monto: 0,
          iva_monto: 0,
          ieps_monto: 0,
          propina: 0,
          total: 0,
        },
      });

      // Si hay items, agregarlos
      if (createOrdenDto.items && createOrdenDto.items.length > 0) {
        for (const item of createOrdenDto.items) {
          await this.agregarItemInterno(tx, orden.id_orden, item);
        }
      }

      // Recalcular totales
      const ordenActualizada = await this.recalcularTotales(tx, orden.id_orden);

      // Obtener orden completa con relaciones
      const full = await tx.ordenes.findUnique({
        where: { id_orden: ordenActualizada.id_orden },
        include: {
          estados_orden: true,
          orden_detalle: { include: { productos: true } },
          sesiones_mesa: { include: { mesas: true } },
        },
      });

      // Si por alguna razón no regresara, abortamos
      if (!full) {
        throw new NotFoundException(
          'No se pudo recuperar la orden recién creada',
        );
      }
      return full;
    });

    // A partir de aquí, `created` es no-null
    await this.cache.set(
      this.keyById(created.id_orden),
      created,
      this.DETAIL_TTL,
    );
    await this.invalidatePerOrdenContext({
      idOrden: created.id_orden,
      idSesion: created.id_sesion_mesa,
      idMesa: created.sesiones_mesa?.mesas?.id_mesa,
    });

    return created;
  }

  async update(id: number, updateOrdenDto: UpdateOrdenDto) {
    const orden = await this.findOne(id);

    if (['pagada', 'cancelada'].includes(orden.estados_orden.nombre)) {
      throw new BadRequestException(
        'No se puede modificar una orden pagada o cancelada',
      );
    }

    const updated = await this.prisma.ordenes.update({
      where: { id_orden: id },
      data: {
        observaciones: updateOrdenDto.observaciones,
        para_llevar: updateOrdenDto.para_llevar,
        updated_at: new Date(),
      },
      include: {
        estados_orden: true,
        orden_detalle: {
          include: {
            productos: true,
          },
        },
      },
    });

    await this.cache.set(this.keyById(id), updated, this.DETAIL_TTL);
    await this.invalidatePerOrdenContext({
      idOrden: id,
      idSesion: updated.id_sesion_mesa,
    });

    return updated;
  }

  // ========== LISTAR ÓRDENES ==========
  async findAll(query: QueryOrdenesDto) {
    const listKey = this.keyList(query);
    const cached = await this.cache.get<any>(listKey);
    if (cached) return cached;

    const where: Prisma.ordenesWhereInput = {};

    if (query.id_sesion_mesa) {
      where.id_sesion_mesa = query.id_sesion_mesa;
    }

    if (query.id_usuario_mesero) {
      where.id_usuario_mesero = query.id_usuario_mesero;
    }

    if (query.id_estado_orden) {
      where.id_estado_orden = query.id_estado_orden;
    }

    if (query.id_mesa) {
      where.sesiones_mesa = {
        id_mesa: query.id_mesa,
      };
    }

    if (query.para_llevar !== undefined) {
      where.para_llevar = query.para_llevar;
    }

    if (query.folio) {
      where.folio = {
        contains: query.folio,
        mode: 'insensitive',
      };
    }

    if (query.fecha_desde || query.fecha_hasta) {
      where.fecha_hora_orden = {};
      if (query.fecha_desde) {
        where.fecha_hora_orden.gte = query.fecha_desde;
      }
      if (query.fecha_hasta) {
        where.fecha_hora_orden.lte = query.fecha_hasta;
      }
    }

    const [ordenes, total] = await Promise.all([
      this.prisma.ordenes.findMany({
        where,
        include: {
          estados_orden: true,
          sesiones_mesa: {
            include: {
              mesas: true,
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
          _count: {
            select: {
              orden_detalle: true,
            },
          },
        },
        orderBy: { fecha_hora_orden: 'desc' },
        take: query.limit || 50,
        skip: query.offset || 0,
      }),
      this.prisma.ordenes.count({ where }),
    ]);

    const result = {
      data: ordenes,
      total,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };

    await this.cache.set(listKey, result, this.LIST_TTL);
    return result;
  }

  // ========== OBTENER ORDEN POR ID ==========
  async findOne(id: number) {
    const key = this.keyById(id);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const orden = await this.prisma.ordenes.findUnique({
      where: { id_orden: id },
      include: {
        estados_orden: true,
        orden_detalle: {
          include: {
            productos: {
              include: {
                categorias: true,
                unidades_medida: true,
              },
            },
          },
          orderBy: { created_at: 'asc' },
        },
        sesiones_mesa: {
          include: {
            mesas: true,
            usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
              select: {
                username: true,
                personas: true,
              },
            },
          },
        },
        usuarios: {
          select: {
            username: true,
            personas: true,
          },
        },
        promociones: true,
      },
    });

    if (!orden) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada`);
    }

    await this.cache.set(key, orden, this.DETAIL_TTL);
    return orden;
  }

  // ========== ÓRDENES POR SESIÓN ==========
  async findBySesion(sesionId: number) {
    const key = this.keySesion(sesionId);
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.ordenes.findMany({
      where: { id_sesion_mesa: sesionId },
      include: {
        estados_orden: true,
        _count: {
          select: { orden_detalle: true },
        },
      },
      orderBy: { fecha_hora_orden: 'desc' },
    });

    await this.cache.set(key, data, this.LIST_TTL);
    return data;
  }

  // ========== ÓRDENES ACTIVAS POR MESA ==========
  async findByMesaActiva(mesaId: number) {
    const key = this.keyMesaActiva(mesaId);
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.ordenes.findMany({
      where: {
        sesiones_mesa: {
          id_mesa: mesaId,
          estado: 'abierta',
        },
        estados_orden: {
          nombre: {
            notIn: ['pagada', 'cancelada'],
          },
        },
      },
      include: {
        estados_orden: true,
        orden_detalle: {
          include: {
            productos: true,
          },
        },
      },
      orderBy: { fecha_hora_orden: 'desc' },
    });

    await this.cache.set(key, data, this.BOARD_TTL);
    return data;
  }

  // ========== AGREGAR ITEM A ORDEN ==========
  async addItem(ordenId: number, addItemDto: AddItemDto) {
    const orden = await this.findOne(ordenId);

    // Verificar que la orden no esté pagada o cancelada
    if (['pagada', 'cancelada'].includes(orden.estados_orden.nombre)) {
      throw new BadRequestException(
        'No se pueden agregar items a una orden pagada o cancelada',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const item = await this.agregarItemInterno(tx, ordenId, addItemDto);
      await this.recalcularTotales(tx, ordenId);

      return tx.orden_detalle.findUnique({
        where: { id_detalle: item.id_detalle },
        include: {
          productos: true,
        },
      });
    });

    await this.invalidatePerOrdenContext({
      idOrden: ordenId,
      idSesion: orden.id_sesion_mesa,
      idMesa: orden.sesiones_mesa?.mesas?.id_mesa,
    });

    return result;
  }

  // ========== AGREGAR MÚLTIPLES ITEMS ==========
  async addMultipleItems(ordenId: number, dto: AddMultipleItemsDto) {
    const orden = await this.findOne(ordenId);

    if (['pagada', 'cancelada'].includes(orden.estados_orden.nombre)) {
      throw new BadRequestException(
        'No se pueden agregar items a una orden pagada o cancelada',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const itemIds: number[] = []; // CORREGIDO: Tipo explícito

      for (const itemDto of dto.items) {
        const item = await this.agregarItemInterno(tx, ordenId, itemDto);
        itemIds.push(item.id_detalle); // CORREGIDO: Guardar solo IDs
      }

      await this.recalcularTotales(tx, ordenId);

      return tx.orden_detalle.findMany({
        where: {
          id_detalle: {
            in: itemIds, // CORREGIDO: Usar array de IDs
          },
        },
        include: {
          productos: true,
        },
      });
    });

    await this.invalidatePerOrdenContext({
      idOrden: ordenId,
      idSesion: orden.id_sesion_mesa,
      idMesa: orden.sesiones_mesa?.mesas?.id_mesa,
    });

    return result;
  }

  // ========== ACTUALIZAR ITEM ==========
  async updateItem(
    ordenId: number,
    itemId: number,
    updateItemDto: UpdateItemDto,
  ) {
    const orden = await this.findOne(ordenId);

    if (['pagada', 'cancelada'].includes(orden.estados_orden.nombre)) {
      throw new BadRequestException(
        'No se pueden modificar items de una orden pagada o cancelada',
      );
    }

    const item = await this.prisma.orden_detalle.findFirst({
      where: {
        id_detalle: itemId,
        id_orden: ordenId,
      },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado en esta orden');
    }

    if (item.estado === 'cancelado') {
      throw new BadRequestException('No se puede modificar un item cancelado');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Actualizar item
      const itemActualizado = await tx.orden_detalle.update({
        where: { id_detalle: itemId },
        data: {
          cantidad: updateItemDto.cantidad ?? item.cantidad,
          notas_especiales: updateItemDto.notas_especiales,
          descuento_porcentaje:
            updateItemDto.descuento_porcentaje ?? item.descuento_porcentaje,
          descuento_monto:
            updateItemDto.descuento_monto ?? item.descuento_monto,
          updated_at: new Date(),
        },
      });

      // Recalcular totales del item
      const calculo = this.calcularTotalesItem({
        cantidad: decimalToNumber(itemActualizado.cantidad),
        precio_unitario: decimalToNumber(itemActualizado.precio_unitario),
        descuento_porcentaje: decimalToNumber(
          itemActualizado.descuento_porcentaje,
        ),
        descuento_monto: decimalToNumber(itemActualizado.descuento_monto),
        iva_tasa: 16, // Por defecto
        ieps_tasa: 0, // Por defecto
      });

      // Actualizar totales del item
      await tx.orden_detalle.update({
        where: { id_detalle: itemId },
        data: {
          subtotal: calculo.subtotal,
          iva_monto: calculo.iva_monto,
          ieps_monto: calculo.ieps_monto,
          total: calculo.total,
        },
        include: {
          productos: true,
        },
      });

      // Recalcular totales de la orden
      await this.recalcularTotales(tx, ordenId);

      return tx.orden_detalle.findUnique({
        where: { id_detalle: itemId },
        include: { productos: true },
      });
    });

    await this.invalidatePerOrdenContext({
      idOrden: ordenId,
      idSesion: orden.id_sesion_mesa,
      idMesa: orden.sesiones_mesa?.mesas?.id_mesa,
    });

    return result;
  }

  // ========== ELIMINAR ITEM ==========
  async removeItem(ordenId: number, itemId: number) {
    const orden = await this.findOne(ordenId);

    if (['pagada', 'cancelada'].includes(orden.estados_orden.nombre)) {
      throw new BadRequestException(
        'No se pueden eliminar items de una orden pagada o cancelada',
      );
    }

    const item = await this.prisma.orden_detalle.findFirst({
      where: {
        id_detalle: itemId,
        id_orden: ordenId,
      },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado en esta orden');
    }

    if (item.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden eliminar items pendientes');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.orden_detalle.delete({
        where: { id_detalle: itemId },
      });

      await this.recalcularTotales(tx, ordenId);

      return { message: 'Item eliminado exitosamente' };
    });

    await this.invalidatePerOrdenContext({
      idOrden: ordenId,
      idSesion: orden.id_sesion_mesa,
      idMesa: orden.sesiones_mesa?.mesas?.id_mesa,
    });

    return result;
  }

  // ========== CAMBIAR ESTADO DE ORDEN ==========
  async cambiarEstado(id: number, dto: CambiarEstadoOrdenDto, userId: number) {
    const orden = await this.findOne(id);

    // invalidar el detalle por si se usa dentro de la transacción
    await this.cacheUtil.invalidate({ keys: [this.keyById(id)] });

    // Verificar que el estado existe
    const nuevoEstado = await this.prisma.estados_orden.findUnique({
      where: { id_estado_orden: dto.id_estado_orden },
    });

    if (!nuevoEstado) {
      throw new BadRequestException('Estado no válido');
    }

    // Validar transición de estado (implementar lógica según reglas de negocio)
    if (
      !this.validarTransicionEstado(
        orden.estados_orden.nombre,
        nuevoEstado.nombre,
      )
    ) {
      throw new BadRequestException(
        `No se puede cambiar de ${orden.estados_orden.nombre} a ${nuevoEstado.nombre}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Actualizar estado
      const ordenActualizada = await tx.ordenes.update({
        where: { id_orden: id },
        data: {
          id_estado_orden: dto.id_estado_orden,
          updated_at: new Date(),
        },
      });

      // Actualizar timestamps según el estado
      const updateData: any = {};

      if (
        nuevoEstado.nombre === 'preparando' &&
        !orden.fecha_hora_preparacion
      ) {
        updateData.fecha_hora_preparacion = new Date();
      }

      if (nuevoEstado.nombre === 'servida' && !orden.fecha_hora_servido) {
        updateData.fecha_hora_servido = new Date();
      }

      if (Object.keys(updateData).length > 0) {
        await tx.ordenes.update({
          where: { id_orden: id },
          data: updateData,
        });
      }

      // Si se confirma la orden, afectar inventario
      if (
        nuevoEstado.nombre === 'confirmada' &&
        orden.estados_orden.nombre === 'pendiente'
      ) {
        await this.afectarInventario(tx, id, 'salida');
      }

      // Si se cancela la orden, revertir inventario
      if (
        nuevoEstado.nombre === 'cancelada' &&
        orden.estados_orden.nombre !== 'pendiente'
      ) {
        await this.afectarInventario(tx, id, 'entrada');
      }

      return ordenActualizada;
    });

    // Invalidaciones (incluye vistas de tablero)
    await this.invalidatePerOrdenContext({
      idOrden: id,
      idSesion: orden.id_sesion_mesa,
      idMesa: orden.sesiones_mesa?.mesas?.id_mesa,
    });

    // Invalidación cruzada si hubo impacto en inventario (confirmada/cancelada)
    if (
      nuevoEstado.nombre === 'confirmada' ||
      nuevoEstado.nombre === 'cancelada'
    ) {
      await this.cacheUtil.invalidate({
        patterns: ['inventario:*'],
        keys: ['productos:stats'],
      });
    }

    // devolver detalle fresco
    return this.findOne(id);
  }

  // ========== CAMBIAR ESTADO DE ITEM ==========
  async cambiarEstadoItem(
    ordenId: number,
    itemId: number,
    dto: CambiarEstadoItemDto,
  ) {
    const item = await this.prisma.orden_detalle.findFirst({
      where: {
        id_detalle: itemId,
        id_orden: ordenId,
      },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }

    // Validar transición de estado
    if (!this.validarTransicionEstadoItem(item.estado, dto.estado)) {
      throw new BadRequestException(
        `No se puede cambiar de ${item.estado} a ${dto.estado}`,
      );
    }

    const updated = await this.prisma.orden_detalle.update({
      where: { id_detalle: itemId },
      data: {
        estado: dto.estado,
        motivo_cancelacion:
          dto.estado === 'cancelado' ? dto.motivo_cancelacion : null,
        id_usuario_prepara: dto.id_usuario_prepara,
        tiempo_preparacion_real:
          dto.estado === 'listo'
            ? Math.floor(
                (new Date().getTime() - item.created_at!.getTime()) / 60000,
              )
            : item.tiempo_preparacion_real,
        updated_at: new Date(),
      },
      include: {
        productos: true,
      },
    });

    // Invalidar vistas relacionadas
    await this.invalidatePerOrdenContext({
      idOrden: ordenId,
    });

    return updated;
  }

  // ========== APLICAR DESCUENTO ==========
  async aplicarDescuento(id: number, dto: AplicarDescuentoDto) {
    const orden = await this.findOne(id);

    if (['pagada', 'cancelada'].includes(orden.estados_orden.nombre)) {
      throw new BadRequestException(
        'No se pueden aplicar descuentos a una orden pagada o cancelada',
      );
    }

    // Si se especifica promoción, validar que existe y está activa
    if (dto.id_promocion_aplicada) {
      const promocion = await this.prisma.promociones.findFirst({
        where: {
          id_promocion: dto.id_promocion_aplicada,
          activa: true,
          fecha_inicio: { lte: new Date() },
          OR: [{ fecha_fin: null }, { fecha_fin: { gte: new Date() } }],
        },
      });

      if (!promocion) {
        throw new BadRequestException('Promoción no válida o inactiva');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.ordenes.update({
        where: { id_orden: id },
        data: {
          descuento_porcentaje:
            dto.descuento_porcentaje ?? orden.descuento_porcentaje,
          descuento_monto: dto.descuento_monto ?? orden.descuento_monto,
          id_promocion_aplicada: dto.id_promocion_aplicada,
          observaciones: dto.motivo_descuento
            ? `${orden.observaciones || ''}\nDescuento: ${dto.motivo_descuento}`.trim()
            : orden.observaciones,
        },
      });

      return this.recalcularTotales(tx, id);
    });

    await this.cache.set(this.keyById(id), updated, this.DETAIL_TTL);
    await this.invalidateListsAndBoards();

    return updated;
  }

  // ========== APLICAR PROPINA ==========
  async aplicarPropina(id: number, dto: AplicarPropinaDto) {
    const orden = await this.findOne(id);

    if (orden.estados_orden.nombre === 'cancelada') {
      throw new BadRequestException(
        'No se puede aplicar propina a una orden cancelada',
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.ordenes.update({
        where: { id_orden: id },
        data: {
          propina: dto.propina,
        },
      });

      return this.recalcularTotales(tx, id);
    });

    await this.cache.set(this.keyById(id), updated, this.DETAIL_TTL);
    await this.invalidateListsAndBoards();

    return updated;
  }

  // ========== VISTA DE COCINA ==========
  async getOrdenesCocina() {
    const key = this.keyCocina();
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.ordenes.findMany({
      where: {
        estados_orden: {
          nombre: {
            in: ['confirmada', 'preparando'],
          },
        },
      },
      include: {
        orden_detalle: {
          where: {
            estado: {
              in: ['pendiente', 'preparando'],
            },
          },
          include: {
            productos: {
              include: {
                categorias: true,
              },
            },
          },
        },
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
      orderBy: { fecha_hora_orden: 'asc' },
    });

    await this.cache.set(key, data, this.BOARD_TTL);
    return data;
  }

  // ========== ÓRDENES PENDIENTES DE PAGO ==========
  async getOrdenesPendientes() {
    const key = this.keyPendientesPago();
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.ordenes.findMany({
      where: {
        estados_orden: {
          nombre: {
            in: ['servida', 'por_pagar'],
          },
        },
      },
      include: {
        sesiones_mesa: {
          include: {
            mesas: true,
          },
        },
        _count: {
          select: { orden_detalle: true },
        },
      },
      orderBy: { fecha_hora_orden: 'asc' },
    });

    await this.cache.set(key, data, this.BOARD_TTL);
    return data;
  }

  // ========== ITEMS POR SERVIR ==========
  async getItemsPorServir() {
    const key = this.keyItemsPorServir();
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.orden_detalle.findMany({
      where: {
        estado: 'listo',
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
      orderBy: { updated_at: 'asc' },
    });

    await this.cache.set(key, data, this.BOARD_TTL);
    return data;
  }

  // ========== MÉTODOS AUXILIARES PRIVADOS ==========

  private async generarFolio(): Promise<string> {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    // Buscar el último folio del día
    const ultimoFolio = await this.prisma.ordenes.findFirst({
      where: {
        folio: {
          startsWith: `ORD${year}${month}${day}`,
        },
      },
      orderBy: { folio: 'desc' },
    });

    let consecutivo = 1;
    if (ultimoFolio) {
      const numeroStr = ultimoFolio.folio.slice(-4);
      consecutivo = parseInt(numeroStr) + 1;
    }

    return `ORD${year}${month}${day}${String(consecutivo).padStart(4, '0')}`;
  }

  private async agregarItemInterno(
    tx: Prisma.TransactionClient,
    ordenId: number,
    itemDto: AddItemDto | CreateOrdenItemDto,
  ) {
    // Obtener producto con sus datos
    const producto = await tx.productos.findUnique({
      where: { id_producto: itemDto.id_producto },
      include: {
        inventario: true,
      },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${itemDto.id_producto} no encontrado`,
      );
    }

    if (!producto.disponible || !producto.es_vendible) {
      throw new BadRequestException(
        `El producto ${producto.nombre} no está disponible para venta`,
      );
    }

    // Verificar inventario si es inventariable
    if (producto.es_inventariable && producto.inventario) {
      const stockActual = decimalToNumber(producto.inventario.stock_actual);
      if (stockActual < itemDto.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${producto.nombre}. Disponible: ${stockActual}`,
        );
      }
    }

    const precioUnitario =
      itemDto.precio_unitario ?? decimalToNumber(producto.precio_venta);
    const descuentoPorcentaje = itemDto.descuento_porcentaje ?? 0;
    const descuentoMonto = itemDto.descuento_monto ?? 0;

    // Calcular totales del item
    const calculo = this.calcularTotalesItem({
      cantidad: itemDto.cantidad,
      precio_unitario: precioUnitario,
      descuento_porcentaje: descuentoPorcentaje,
      descuento_monto: descuentoMonto,
      iva_tasa: decimalToNumber(producto.iva_tasa),
      ieps_tasa: decimalToNumber(producto.ieps_tasa),
    });

    // Crear item
    return tx.orden_detalle.create({
      data: {
        id_orden: ordenId,
        id_producto: itemDto.id_producto,
        cantidad: itemDto.cantidad,
        precio_unitario: precioUnitario,
        descuento_porcentaje: descuentoPorcentaje,
        descuento_monto: descuentoMonto,
        subtotal: calculo.subtotal,
        iva_monto: calculo.iva_monto,
        ieps_monto: calculo.ieps_monto,
        total: calculo.total,
        notas_especiales: itemDto.notas_especiales,
        estado: 'pendiente',
      },
    });
  }

  private calcularTotalesItem(params: {
    cantidad: number;
    precio_unitario: number;
    descuento_porcentaje: number;
    descuento_monto: number;
    iva_tasa: number;
    ieps_tasa: number;
  }): ItemCalculado {
    const subtotalBruto = params.cantidad * params.precio_unitario;

    // Aplicar descuentos
    let descuentoTotal = params.descuento_monto;
    if (params.descuento_porcentaje > 0) {
      descuentoTotal += subtotalBruto * (params.descuento_porcentaje / 100);
    }

    const subtotal = subtotalBruto - descuentoTotal;

    // Calcular impuestos sobre el subtotal con descuento
    const iva_monto = subtotal * (params.iva_tasa / 100);
    const ieps_monto = subtotal * (params.ieps_tasa / 100);

    const total = subtotal + iva_monto + ieps_monto;

    return {
      cantidad: params.cantidad,
      precio_unitario: params.precio_unitario,
      descuento_porcentaje: params.descuento_porcentaje,
      descuento_monto: descuentoTotal,
      subtotal,
      iva_monto,
      ieps_monto,
      total,
    };
  }

  private async recalcularTotales(
    tx: Prisma.TransactionClient,
    ordenId: number,
  ) {
    // Obtener todos los items de la orden
    const items = await tx.orden_detalle.findMany({
      where: {
        id_orden: ordenId,
        estado: {
          not: 'cancelado',
        },
      },
    });

    // Obtener la orden actual
    const orden = await tx.ordenes.findUnique({
      where: { id_orden: ordenId },
    });

    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Sumar totales de items
    let subtotalItems = 0;
    let ivaItems = 0;
    let iepsItems = 0;

    for (const item of items) {
      subtotalItems += decimalToNumber(item.subtotal);
      ivaItems += decimalToNumber(item.iva_monto);
      iepsItems += decimalToNumber(item.ieps_monto);
    }

    // Aplicar descuentos de la orden
    let descuentoOrden = decimalToNumber(orden.descuento_monto);
    if (
      orden.descuento_porcentaje &&
      decimalToNumber(orden.descuento_porcentaje) > 0
    ) {
      descuentoOrden +=
        subtotalItems * (decimalToNumber(orden.descuento_porcentaje) / 100);
    }

    const subtotalFinal = subtotalItems - descuentoOrden;
    const propinaFinal = decimalToNumber(orden.propina);
    const totalFinal = subtotalFinal + ivaItems + iepsItems + propinaFinal;

    // Actualizar orden
    return tx.ordenes.update({
      where: { id_orden: ordenId },
      data: {
        subtotal: subtotalItems,
        descuento_monto: descuentoOrden,
        iva_monto: ivaItems,
        ieps_monto: iepsItems,
        total: totalFinal,
        updated_at: new Date(),
      },
      include: {
        estados_orden: true,
        orden_detalle: {
          include: {
            productos: true,
          },
        },
      },
    });
  }

  private validarTransicionEstado(
    estadoActual: string,
    estadoNuevo: string,
  ): boolean {
    const transicionesValidas: Record<string, string[]> = {
      pendiente: ['confirmada', 'cancelada'],
      confirmada: ['preparando', 'cancelada'],
      preparando: ['lista', 'cancelada'],
      lista: ['servida', 'cancelada'],
      servida: ['por_pagar', 'pagada', 'cancelada'],
      por_pagar: ['pagada', 'cancelada'],
      pagada: [], // No se puede cambiar
      cancelada: [], // No se puede cambiar
    };

    return transicionesValidas[estadoActual]?.includes(estadoNuevo) || false;
  }

  private validarTransicionEstadoItem(
    estadoActual: estado_orden_detalle | null,
    estadoNuevo: estado_orden_detalle,
  ): boolean {
    if (!estadoActual) estadoActual = 'pendiente';

    const transicionesValidas: Record<
      estado_orden_detalle,
      estado_orden_detalle[]
    > = {
      pendiente: ['preparando', 'cancelado'],
      preparando: ['listo', 'cancelado'],
      listo: ['servido', 'cancelado'],
      servido: [], // Estado final
      cancelado: [], // No se puede cambiar
    };

    return transicionesValidas[estadoActual]?.includes(estadoNuevo) || false;
  }

  private async afectarInventario(
    tx: Prisma.TransactionClient,
    ordenId: number,
    tipo: 'entrada' | 'salida',
  ) {
    const items = await tx.orden_detalle.findMany({
      where: {
        id_orden: ordenId,
        estado: {
          not: 'cancelado',
        },
      },
      include: {
        productos: {
          include: {
            inventario: true,
          },
        },
      },
    });

    for (const item of items) {
      if (item.productos.es_inventariable && item.productos.inventario) {
        const cantidadMovimiento = decimalToNumber(item.cantidad);
        const stockActual = decimalToNumber(
          item.productos.inventario.stock_actual,
        );

        const nuevoStock =
          tipo === 'salida'
            ? stockActual - cantidadMovimiento
            : stockActual + cantidadMovimiento;

        if (nuevoStock < 0) {
          throw new BadRequestException(
            `Stock insuficiente para ${item.productos.nombre}`,
          );
        }

        await tx.inventario.update({
          where: { id_inventario: item.productos.inventario.id_inventario },
          data: {
            stock_actual: nuevoStock,
            updated_at: new Date(),
          },
        });

        // Registrar movimiento de inventario (si tienes la tabla)
        // await tx.movimientos_inventario.create({...});
      }
    }
  }
}
