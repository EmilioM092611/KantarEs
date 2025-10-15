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
import { QueryOrdenesDto } from './dto/query-ordenes.dto';
import { AddMultipleItemsDto } from './dto/add-multiple-items.dto';
import {
  CalculoTotales,
  ItemCalculado,
  decimalToNumber,
} from './types/orden.types';
import { estado_orden_detalle, Prisma } from '@prisma/client';
import { FolioService } from './services/folio.service';
import { EstadoOrdenNombre } from './enums/orden-estados.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OrdenesService {
  private readonly logger = new Logger(OrdenesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly folioService: FolioService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ========== CREAR ORDEN ==========
  async create(createOrdenDto: CreateOrdenDto, userId: number) {
    // Verificar que la sesión existe y está abierta
    const sesion = await this.prisma.sesiones_mesa.findFirst({
      where: {
        id_sesion: createOrdenDto.id_sesion_mesa,
        estado: 'abierta',
      },
      include: {
        mesas: true,
      },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión de mesa no encontrada o cerrada');
    }

    // Generar folio único
    const folio = await this.folioService.generarFolioOrden();

    // Obtener el estado inicial (pendiente)
    const estadoInicial = await this.prisma.estados_orden.findFirst({
      where: { nombre: 'pendiente' },
    });

    if (!estadoInicial) {
      throw new BadRequestException('Estado inicial no configurado');
    }

    // Crear la orden con transacción
    return this.prisma.$transaction(async (tx) => {
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
      return tx.ordenes.findUnique({
        where: { id_orden: ordenActualizada.id_orden },
        include: {
          estados_orden: true,
          orden_detalle: {
            include: {
              productos: true,
            },
          },
          sesiones_mesa: {
            include: {
              mesas: true,
            },
          },
        },
      });
    });
  }
  async update(id: number, updateOrdenDto: UpdateOrdenDto) {
    const orden = await this.findOne(id);

    if (['pagada', 'cancelada'].includes(orden.estados_orden.nombre)) {
      throw new BadRequestException(
        'No se puede modificar una orden pagada o cancelada',
      );
    }

    return this.prisma.ordenes.update({
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
  }

  // ========== LISTAR ÓRDENES ==========
  async findAll(query: QueryOrdenesDto) {
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

    return {
      data: ordenes,
      total,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };
  }

  // ========== OBTENER ORDEN POR ID ==========
  async findOne(id: number) {
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

    return orden;
  }

  // ========== ÓRDENES POR SESIÓN ==========
  async findBySesion(sesionId: number) {
    return this.prisma.ordenes.findMany({
      where: { id_sesion_mesa: sesionId },
      include: {
        estados_orden: true,
        _count: {
          select: { orden_detalle: true },
        },
      },
      orderBy: { fecha_hora_orden: 'desc' },
    });
  }

  async findByEstado(estado: EstadoOrdenNombre) {
    // Buscar el estado en la BD por nombre (case-insensitive)
    const estadoRecord = await this.prisma.estados_orden.findFirst({
      where: {
        nombre: {
          equals: estado,
          mode: 'insensitive',
        },
      },
    });

    if (!estadoRecord) {
      throw new NotFoundException(`Estado ${estado} no encontrado`);
    }

    return this.prisma.ordenes.findMany({
      where: { id_estado_orden: estadoRecord.id_estado_orden },
      include: {
        estados_orden: true,
        orden_detalle: {
          include: { productos: true },
        },
      },
    });
  }

  // ========== ÓRDENES ACTIVAS POR MESA ==========
  async findByMesaActiva(mesaId: number) {
    return this.prisma.ordenes.findMany({
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

    return this.prisma.$transaction(async (tx) => {
      const item = await this.agregarItemInterno(tx, ordenId, addItemDto);
      await this.recalcularTotales(tx, ordenId);

      return tx.orden_detalle.findUnique({
        where: { id_detalle: item.id_detalle },
        include: {
          productos: true,
        },
      });
    });
  }

  // ========== AGREGAR MÚLTIPLES ITEMS ==========
  async addMultipleItems(ordenId: number, dto: AddMultipleItemsDto) {
    const orden = await this.findOne(ordenId);

    if (['pagada', 'cancelada'].includes(orden.estados_orden.nombre)) {
      throw new BadRequestException(
        'No se pueden agregar items a una orden pagada o cancelada',
      );
    }

    return this.prisma.$transaction(async (tx) => {
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

    return this.prisma.$transaction(async (tx) => {
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

    return this.prisma.$transaction(async (tx) => {
      await tx.orden_detalle.delete({
        where: { id_detalle: itemId },
      });

      await this.recalcularTotales(tx, ordenId);

      return { message: 'Item eliminado exitosamente' };
    });
  }

  // ========== CAMBIAR ESTADO DE ORDEN ==========
  async cambiarEstado(id: number, dto: CambiarEstadoOrdenDto, userId: number) {
    const orden = await this.findOne(id);

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

    return this.prisma.$transaction(async (tx) => {
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

      // Emitir evento cuando la orden se confirma
      if (nuevoEstado.nombre === 'confirmada') {
        this.eventEmitter.emit('orden.confirmada', {
          id_orden: id,
          id_sesion_mesa: orden.id_sesion_mesa,
          timestamp: new Date(),
        });
      }

      // Si se cancela la orden, revertir inventario
      if (
        nuevoEstado.nombre === 'cancelada' &&
        orden.estados_orden.nombre !== 'pendiente'
      ) {
        await this.afectarInventario(tx, id, 'entrada');
      }

      return this.findOne(id);
    });
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

    return this.prisma.orden_detalle.update({
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

    return this.prisma.$transaction(async (tx) => {
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
  }

  // ========== APLICAR PROPINA ==========
  async aplicarPropina(id: number, dto: AplicarPropinaDto) {
    const orden = await this.findOne(id);

    if (orden.estados_orden.nombre === 'cancelada') {
      throw new BadRequestException(
        'No se puede aplicar propina a una orden cancelada',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.ordenes.update({
        where: { id_orden: id },
        data: {
          propina: dto.propina,
        },
      });

      return this.recalcularTotales(tx, id);
    });
  }

  // ========== VISTA DE COCINA ==========
  async getOrdenesCocina() {
    return this.prisma.ordenes.findMany({
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
  }

  // ========== ÓRDENES PENDIENTES DE PAGO ==========
  async getOrdenesPendientes() {
    return this.prisma.ordenes.findMany({
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
  }

  // ========== ITEMS POR SERVIR ==========
  async getItemsPorServir() {
    return this.prisma.orden_detalle.findMany({
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
  }

  // ========== MÉTODOS AUXILIARES PRIVADOS ==========

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

    // Buscar el tipo de movimiento por nombre, no por ID
    const nombreTipoMovimiento =
      tipo === 'salida' ? 'Salida por venta' : 'Devolución de cliente';
    const tipoMovimiento = await tx.tipos_movimiento.findFirst({
      where: {
        nombre: {
          equals: nombreTipoMovimiento,
          mode: 'insensitive',
        },
      },
    });

    if (!tipoMovimiento) {
      this.logger.warn(
        `Tipo de movimiento '${nombreTipoMovimiento}' no encontrado`,
      );
    }

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

        // Registrar movimiento de inventario si existe la tabla y el tipo
        if (tipoMovimiento) {
          await tx.movimientos_inventario.create({
            data: {
              id_tipo_movimiento: tipoMovimiento.id_tipo_movimiento,
              id_producto: item.id_producto,
              id_usuario: 1, // TODO: Pasar el userId real
              cantidad: new Prisma.Decimal(cantidadMovimiento),
              id_unidad_medida: item.productos.id_unidad_medida,
              fecha_movimiento: new Date(),
              id_orden: ordenId,
              observaciones:
                tipo === 'salida'
                  ? 'Salida automática por venta'
                  : 'Devolución por cancelación',
            },
          });
        }
      }
    }
  }
}
