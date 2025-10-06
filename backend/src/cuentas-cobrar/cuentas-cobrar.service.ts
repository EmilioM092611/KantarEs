import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CuentasCobrarService {
  constructor(private readonly prisma: PrismaService) {}

  crearCuenta(dto: {
    id_persona: number;
    referencia: string;
    vencimiento?: string;
  }) {
    return this.prisma.cuentas_cobrar.create({
      data: {
        id_persona: Number(dto.id_persona),
        referencia: dto.referencia,
        vencimiento: dto.vencimiento ? new Date(dto.vencimiento) : null,
        saldo: 0 as any,
        estado: 'abierta',
      },
    });
  }

  listar(q: {
    estado?: 'abierta' | 'parcial' | 'liquidada';
    id_persona?: number;
  }) {
    const where: any = {};
    if (q.estado) where.estado = q.estado;
    if (q.id_persona) where.id_persona = Number(q.id_persona);
    return this.prisma.cuentas_cobrar.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  async detalle(id_cc: number) {
    const cc = await this.prisma.cuentas_cobrar.findUnique({
      where: { id_cc },
    });
    if (!cc) throw new NotFoundException('Cuenta no encontrada');
    const movs = await this.prisma.cc_movimientos.findMany({
      where: { id_cc },
      orderBy: { fecha: 'asc' },
    });
    return { ...cc, movimientos: movs };
  }

  private async actualizarEstado(id_cc: number, saldo: number) {
    let estado: 'abierta' | 'parcial' | 'liquidada' = 'abierta';
    if (saldo <= 0) estado = 'liquidada';
    else estado = 'parcial';
    await this.prisma.cuentas_cobrar.update({
      where: { id_cc },
      data: { saldo: Math.max(0, saldo) as any, estado },
    });
  }

  async cargo(
    id_cc: number,
    dto: { monto: string | number; referencia?: string; id_orden?: number },
  ) {
    const cc = await this.prisma.cuentas_cobrar.findUnique({
      where: { id_cc },
    });
    if (!cc) throw new NotFoundException('Cuenta no encontrada');

    const monto = Number(dto.monto);
    if (isNaN(monto) || monto <= 0)
      throw new BadRequestException('Monto inválido');

    await this.prisma.cc_movimientos.create({
      data: {
        id_cc,
        tipo: 'cargo',
        monto: monto as any,
        referencia: dto.referencia ?? null,
        id_orden: dto.id_orden ?? null,
      },
    });

    await this.actualizarEstado(id_cc, Number(cc.saldo) + monto);
    return { ok: true };
  }

  async abono(
    id_cc: number,
    dto: { monto: string | number; referencia?: string; id_pago?: number },
  ) {
    const cc = await this.prisma.cuentas_cobrar.findUnique({
      where: { id_cc },
    });
    if (!cc) throw new NotFoundException('Cuenta no encontrada');

    const monto = Number(dto.monto);
    if (isNaN(monto) || monto <= 0)
      throw new BadRequestException('Monto inválido');

    await this.prisma.cc_movimientos.create({
      data: {
        id_cc,
        tipo: 'abono',
        monto: monto as any,
        referencia: dto.referencia ?? null,
        id_pago: dto.id_pago ?? null,
      },
    });

    await this.actualizarEstado(id_cc, Number(cc.saldo) - monto);
    return { ok: true };
  }
}
