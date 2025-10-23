/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addDays } from 'date-fns';

@Injectable()
export class CuentasPagarService {
  constructor(private prisma: PrismaService) {}

  async crearCuentaPagar(idCompra: number): Promise<any> {
    const compra = await this.prisma.compras.findUnique({
      where: { id_compra: idCompra },
      include: { proveedores: true },
    });

    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }

    if (compra.estado !== 'recibida') {
      throw new BadRequestException(
        'Solo se pueden crear cuentas por pagar para compras recibidas',
      );
    }

    if (!compra.total) {
      throw new BadRequestException('La compra no tiene un monto total válido');
    }

    const fechaVencimiento = addDays(
      new Date(),
      compra.proveedores.dias_credito || 30,
    );

    const cuenta = await this.prisma.cuentas_pagar.create({
      data: {
        id_compra: idCompra,
        id_proveedor: compra.id_proveedor,
        monto_total: compra.total,
        monto_pagado: 0,
        saldo_pendiente: compra.total,
        fecha_emision: new Date(),
        fecha_vencimiento: fechaVencimiento,
        dias_credito: compra.proveedores.dias_credito || 30,
      },
    });

    return cuenta;
  }

  async registrarPago(dto: any): Promise<any> {
    const cuenta = await this.prisma.cuentas_pagar.findUnique({
      where: { id_cuenta_pagar: dto.id_cuenta_pagar },
    });

    if (!cuenta) {
      throw new NotFoundException('Cuenta por pagar no encontrada');
    }

    if (dto.monto_pago > Number(cuenta.saldo_pendiente)) {
      throw new BadRequestException(
        'El monto del pago excede el saldo pendiente',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Registrar pago
      const pago = await tx.pagos_proveedor.create({
        data: {
          id_cuenta_pagar: dto.id_cuenta_pagar,
          monto_pago: dto.monto_pago,
          fecha_pago: new Date(dto.fecha_pago),
          forma_pago: dto.forma_pago,
          referencia: dto.referencia,
          id_usuario: dto.id_usuario,
          observaciones: dto.observaciones,
        },
      });

      // Actualizar cuenta
      const nuevoMontoPagado = Number(cuenta.monto_pagado) + dto.monto_pago;
      const nuevoSaldo = Number(cuenta.monto_total) - nuevoMontoPagado;

      const nuevoEstado =
        nuevoSaldo === 0
          ? 'pagada'
          : nuevoMontoPagado > 0
            ? 'parcial'
            : 'pendiente';

      const cuentaActualizada = await tx.cuentas_pagar.update({
        where: { id_cuenta_pagar: dto.id_cuenta_pagar },
        data: {
          monto_pagado: nuevoMontoPagado,
          saldo_pendiente: nuevoSaldo,
          estado: nuevoEstado,
          actualizado_en: new Date(),
        },
      });

      // Si se pagó completamente, marcar compra como pagada
      if (nuevoEstado === 'pagada') {
        await tx.compras.update({
          where: { id_compra: cuenta.id_compra },
          data: { estado: 'pagada' },
        });
      }

      return { pago, cuenta: cuentaActualizada };
    });

    return result;
  }

  async getCuentasPorPagar(filtros?: any): Promise<any> {
    const where: any = {};

    if (filtros?.id_proveedor) {
      where.id_proveedor = filtros.id_proveedor;
    }

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    const cuentas = await this.prisma.cuentas_pagar.findMany({
      where,
      include: {
        proveedores: {
          select: { nombre_comercial: true, rfc: true },
        },
        compras: {
          select: { folio_compra: true },
        },
        pagos_proveedor: {
          orderBy: { fecha_pago: 'desc' },
        },
      },
      orderBy: { fecha_vencimiento: 'asc' },
    });

    // Actualizar días vencidos
    const hoy = new Date();
    const cuentasConEstado = cuentas.map((cuenta) => {
      const diasVencidos = Math.floor(
        (hoy.getTime() - new Date(cuenta.fecha_vencimiento).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      return {
        ...cuenta,
        dias_vencidos: diasVencidos > 0 ? diasVencidos : 0,
        esta_vencida: diasVencidos > 0 && cuenta.estado !== 'pagada',
      };
    });

    return cuentasConEstado;
  }

  async getResumenCuentasPagar(): Promise<any> {
    const [total, porEstado, porVencer] = await Promise.all([
      this.prisma.cuentas_pagar.aggregate({
        _sum: { saldo_pendiente: true },
        _count: true,
      }),
      this.prisma.cuentas_pagar.groupBy({
        by: ['estado'],
        _sum: { saldo_pendiente: true },
        _count: true,
      }),
      this.prisma.cuentas_pagar.findMany({
        where: {
          estado: { in: ['pendiente', 'parcial'] },
          fecha_vencimiento: {
            lte: addDays(new Date(), 7),
          },
        },
        include: {
          proveedores: {
            select: { nombre_comercial: true },
          },
          compras: {
            select: { folio_compra: true },
          },
        },
      }),
    ]);

    return {
      totales: {
        saldo_pendiente_total: total._sum.saldo_pendiente || 0,
        total_cuentas: total._count,
      },
      por_estado: porEstado,
      cuentas_por_vencer_7_dias: porVencer,
    };
  }

  async programarPagos(): Promise<any> {
    const cuentasPendientes = await this.getCuentasPorPagar({
      estado: 'pendiente',
    });

    // Ordenar por prioridad (vencidas primero, luego por vencer)
    const programacion = cuentasPendientes
      .sort((a: any, b: any) => {
        if (a.esta_vencida && !b.esta_vencida) return -1;
        if (!a.esta_vencida && b.esta_vencida) return 1;
        return (
          new Date(a.fecha_vencimiento).getTime() -
          new Date(b.fecha_vencimiento).getTime()
        );
      })
      .map((cuenta: any, index: number) => ({
        prioridad: index + 1,
        folio_compra: cuenta.compras.folio_compra,
        proveedor: cuenta.proveedores.nombre_comercial,
        monto: cuenta.saldo_pendiente,
        fecha_vencimiento: cuenta.fecha_vencimiento,
        dias_vencidos: cuenta.dias_vencidos,
        urgencia: cuenta.esta_vencida
          ? 'Vencida'
          : cuenta.dias_vencidos <= 3
            ? 'Muy urgente'
            : cuenta.dias_vencidos <= 7
              ? 'Urgente'
              : 'Normal',
      }));

    return {
      fecha_generacion: new Date(),
      total_cuentas: programacion.length,
      monto_total: programacion.reduce(
        (sum: number, c: any) => sum + Number(c.monto),
        0,
      ),
      programacion,
    };
  }
}
