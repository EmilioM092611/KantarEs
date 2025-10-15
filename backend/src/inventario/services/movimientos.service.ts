/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoMovimientoNombre } from '../enums/tipo-movimiento.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class MovimientosInventarioService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra salida de inventario por venta sin IDs mágicos
   */
  async registrarSalidaPorVenta(
    id_orden: number,
    detalles: any[],
    userId: number,
  ) {
    // Buscar tipo por nombre, no por ID mágico
    const tipoSalida = await this.prisma.tipos_movimiento.findFirst({
      where: {
        nombre: {
          equals: TipoMovimientoNombre.SALIDA_VENTA,
          mode: 'insensitive',
        },
      },
    });

    if (!tipoSalida) {
      throw new NotFoundException(
        `Tipo de movimiento '${TipoMovimientoNombre.SALIDA_VENTA}' no configurado en la base de datos`,
      );
    }

    const movimientos = detalles.map((detalle) => ({
      id_tipo_movimiento: tipoSalida.id_tipo_movimiento,
      id_producto: detalle.id_producto,
      cantidad: new Prisma.Decimal(detalle.cantidad),
      id_unidad_medida:
        detalle.id_unidad_medida || detalle.productos?.id_unidad_medida,
      id_orden,
      id_usuario: userId,
      fecha_movimiento: new Date(),
      observaciones: 'Salida automática por venta',
    }));

    return this.prisma.movimientos_inventario.createMany({
      data: movimientos,
    });
  }

  /**
   * Registra entrada de inventario por compra
   */
  async registrarEntradaPorCompra(
    id_compra: number,
    detalles: any[],
    userId: number,
  ) {
    const tipoEntrada = await this.prisma.tipos_movimiento.findFirst({
      where: {
        nombre: {
          equals: TipoMovimientoNombre.ENTRADA_COMPRA,
          mode: 'insensitive',
        },
      },
    });

    if (!tipoEntrada) {
      throw new NotFoundException(
        `Tipo de movimiento '${TipoMovimientoNombre.ENTRADA_COMPRA}' no configurado`,
      );
    }

    const movimientos = detalles.map((detalle) => ({
      id_tipo_movimiento: tipoEntrada.id_tipo_movimiento,
      id_producto: detalle.id_producto,
      cantidad: new Prisma.Decimal(detalle.cantidad),
      id_unidad_medida: detalle.id_unidad_medida,
      id_compra,
      id_usuario: userId,
      fecha_movimiento: new Date(),
      costo_unitario: new Prisma.Decimal(detalle.costo_unitario || 0),
      lote: detalle.lote,
      fecha_caducidad: detalle.fecha_caducidad
        ? new Date(detalle.fecha_caducidad)
        : null,
      observaciones: 'Entrada por compra',
    }));

    return this.prisma.movimientos_inventario.createMany({
      data: movimientos,
    });
  }

  /**
   * Registra ajuste de inventario
   */
  async registrarAjuste(
    id_producto: number,
    cantidad: number,
    motivo: string,
    userId: number,
  ) {
    const tipoAjuste = await this.prisma.tipos_movimiento.findFirst({
      where: {
        nombre: {
          equals: TipoMovimientoNombre.AJUSTE_INVENTARIO,
          mode: 'insensitive',
        },
      },
    });

    if (!tipoAjuste) {
      throw new NotFoundException(
        'Tipo de movimiento de ajuste no configurado',
      );
    }

    const producto = await this.prisma.productos.findUnique({
      where: { id_producto },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.prisma.movimientos_inventario.create({
      data: {
        id_tipo_movimiento: tipoAjuste.id_tipo_movimiento,
        id_producto,
        cantidad: new Prisma.Decimal(cantidad),
        id_unidad_medida: producto.id_unidad_medida,
        id_usuario: userId,
        fecha_movimiento: new Date(),
        observaciones: motivo,
      },
    });
  }
}
