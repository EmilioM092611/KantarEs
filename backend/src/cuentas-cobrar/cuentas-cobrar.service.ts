import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CuentasCobrarService {
  constructor(private readonly prisma: PrismaService) {}

  // === MEJORA 10: Funcionalidades avanzadas de CxC ===

  async crearCuenta(dto: {
    id_persona: number;
    referencia: string;
    vencimiento?: string;
  }) {
    // Validar que la persona existe
    const persona = await this.prisma.personas.findUnique({
      where: { id_persona: Number(dto.id_persona) },
    });

    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    const cuenta = await this.prisma.cuentas_cobrar.create({
      data: {
        id_persona: Number(dto.id_persona),
        referencia: dto.referencia,
        vencimiento: dto.vencimiento ? new Date(dto.vencimiento) : null,
        saldo: 0 as any,
        estado: 'abierta',
      },
      include: {
        personas: true,
      },
    });

    return {
      success: true,
      message: 'Cuenta creada exitosamente',
      data: cuenta,
    };
  }

  async listar(q: {
    estado?: 'abierta' | 'parcial' | 'liquidada';
    id_persona?: string;
    desde?: string;
    hasta?: string;
    vencidas?: 'true' | 'false';
    page?: string;
    limit?: string;
  }) {
    const where: any = {};

    if (q.estado) where.estado = q.estado;
    if (q.id_persona) where.id_persona = Number(q.id_persona);

    // Filtro por rango de fechas
    if (q.desde || q.hasta) {
      where.created_at = {};
      if (q.desde) where.created_at.gte = new Date(q.desde);
      if (q.hasta) where.created_at.lte = new Date(q.hasta);
    }

    // Filtro por vencidas
    if (q.vencidas === 'true') {
      where.vencimiento = { lt: new Date() };
      where.estado = { not: 'liquidada' };
    }

    // Paginación
    const page = q.page ? parseInt(q.page) : 1;
    const limit = q.limit ? parseInt(q.limit) : 20;
    const skip = (page - 1) * limit;

    const [cuentas, total] = await Promise.all([
      this.prisma.cuentas_cobrar.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          personas: {
            select: {
              nombre: true,
              apellido_paterno: true,
              apellido_materno: true,
            },
          },
        },
      }),
      this.prisma.cuentas_cobrar.count({ where }),
    ]);

    // Calcular totales
    const totales = await this.prisma.cuentas_cobrar.aggregate({
      where,
      _sum: {
        saldo: true,
      },
    });

    return {
      success: true,
      data: cuentas,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      totales: {
        saldo_total: totales._sum.saldo || 0,
      },
    };
  }

  async getResumen() {
    const [abiertas, parciales, liquidadas, vencidas] = await Promise.all([
      this.prisma.cuentas_cobrar.aggregate({
        where: { estado: 'abierta' },
        _sum: { saldo: true },
        _count: true,
      }),
      this.prisma.cuentas_cobrar.aggregate({
        where: { estado: 'parcial' },
        _sum: { saldo: true },
        _count: true,
      }),
      this.prisma.cuentas_cobrar.aggregate({
        where: { estado: 'liquidada' },
        _count: true,
      }),
      this.prisma.cuentas_cobrar.count({
        where: {
          vencimiento: { lt: new Date() },
          estado: { not: 'liquidada' },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        abiertas: {
          count: abiertas._count,
          saldo_total: abiertas._sum.saldo || 0,
        },
        parciales: {
          count: parciales._count,
          saldo_total: parciales._sum.saldo || 0,
        },
        liquidadas: {
          count: liquidadas._count,
        },
        vencidas: {
          count: vencidas,
        },
        total_por_cobrar:
          Number(abiertas._sum.saldo || 0) + Number(parciales._sum.saldo || 0),
      },
    };
  }

  async reporteAntiguedad(id_persona?: number) {
    const where: any = {
      estado: { not: 'liquidada' },
      saldo: { gt: 0 },
    };

    if (id_persona) {
      where.id_persona = id_persona;
    }

    const cuentas = await this.prisma.cuentas_cobrar.findMany({
      where,
      include: {
        personas: {
          select: {
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
          },
        },
      },
    });

    const hoy = new Date();
    const reporte = cuentas.map((cuenta) => {
      const diasVencidos = cuenta.vencimiento
        ? Math.floor(
            (hoy.getTime() - cuenta.vencimiento.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0;

      let categoria = 'Corriente';
      if (diasVencidos > 90) categoria = 'Más de 90 días';
      else if (diasVencidos > 60) categoria = '61-90 días';
      else if (diasVencidos > 30) categoria = '31-60 días';
      else if (diasVencidos > 0) categoria = '1-30 días';

      return {
        id_cc: cuenta.id_cc,
        referencia: cuenta.referencia,
        cliente: `${cuenta.personas.nombre} ${cuenta.personas.apellido_paterno}`,
        saldo: Number(cuenta.saldo),
        vencimiento: cuenta.vencimiento,
        dias_vencidos: Math.max(0, diasVencidos),
        categoria,
      };
    });

    // Agrupar por categoría
    const porCategoria = {
      corriente: 0,
      vencido_1_30: 0,
      vencido_31_60: 0,
      vencido_61_90: 0,
      vencido_mas_90: 0,
    };

    reporte.forEach((item) => {
      const saldo = Number(item.saldo);
      if (item.categoria === 'Corriente') porCategoria.corriente += saldo;
      else if (item.categoria === '1-30 días')
        porCategoria.vencido_1_30 += saldo;
      else if (item.categoria === '31-60 días')
        porCategoria.vencido_31_60 += saldo;
      else if (item.categoria === '61-90 días')
        porCategoria.vencido_61_90 += saldo;
      else if (item.categoria === 'Más de 90 días')
        porCategoria.vencido_mas_90 += saldo;
    });

    return {
      success: true,
      data: {
        detalle: reporte,
        resumen: porCategoria,
        total: Object.values(porCategoria).reduce((a, b) => a + b, 0),
      },
    };
  }

  async detalle(id_cc: number) {
    const cc = await this.prisma.cuentas_cobrar.findUnique({
      where: { id_cc },
      include: {
        personas: true,
      },
    });

    if (!cc) throw new NotFoundException('Cuenta no encontrada');

    const movs = await this.prisma.cc_movimientos.findMany({
      where: { id_cc },
      orderBy: { fecha: 'asc' },
      include: {
        ordenes: {
          select: {
            folio: true,
            total: true,
          },
        },
        pagos: {
          select: {
            folio_pago: true,
            monto: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        ...cc,
        movimientos: movs,
        total_cargos: movs
          .filter((m) => m.tipo === 'cargo')
          .reduce((sum, m) => sum + Number(m.monto), 0),
        total_abonos: movs
          .filter((m) => m.tipo === 'abono')
          .reduce((sum, m) => sum + Number(m.monto), 0),
      },
    };
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

    return {
      success: true,
      message: 'Cargo registrado exitosamente',
    };
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

    if (monto > Number(cc.saldo)) {
      throw new BadRequestException(
        'El abono no puede ser mayor al saldo pendiente',
      );
    }

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

    return {
      success: true,
      message: 'Abono registrado exitosamente',
    };
  }

  async conciliar(id_cc: number, dto: { id_pago?: number; monto?: number }) {
    const cc = await this.prisma.cuentas_cobrar.findUnique({
      where: { id_cc },
    });
    if (!cc) throw new NotFoundException('Cuenta no encontrada');

    if (dto.id_pago) {
      const pago = await this.prisma.pagos.findUnique({
        where: { id_pago: dto.id_pago },
      });

      if (!pago) {
        throw new NotFoundException('Pago no encontrado');
      }

      // Verificar que no esté ya conciliado
      const yaExiste = await this.prisma.cc_movimientos.findFirst({
        where: {
          id_cc,
          id_pago: dto.id_pago,
        },
      });

      if (yaExiste) {
        throw new BadRequestException('Este pago ya fue conciliado');
      }

      // Registrar abono automático
      await this.abono(id_cc, {
        monto: Number(pago.monto),
        referencia: `Conciliación automática - ${pago.folio_pago}`,
        id_pago: dto.id_pago,
      });

      return {
        success: true,
        message: 'Conciliación completada exitosamente',
      };
    }

    throw new BadRequestException('Debe proporcionar id_pago para conciliar');
  }

  async getCuentasPorCliente(id_persona: number) {
    const persona = await this.prisma.personas.findUnique({
      where: { id_persona },
    });

    if (!persona) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const cuentas = await this.prisma.cuentas_cobrar.findMany({
      where: { id_persona },
      orderBy: { created_at: 'desc' },
    });

    const totales = await this.prisma.cuentas_cobrar.aggregate({
      where: { id_persona },
      _sum: { saldo: true },
    });

    return {
      success: true,
      data: {
        cliente: persona,
        cuentas,
        total_cuentas: cuentas.length,
        saldo_total: totales._sum.saldo || 0,
      },
    };
  }
}
