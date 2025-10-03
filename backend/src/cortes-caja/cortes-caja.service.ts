import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCorteCajaDto } from './dto/create-corte-caja.dto';
import { CloseCorteCajaDto } from './dto/close-corte-caja.dto';
import { CancelCorteCajaDto } from './dto/cancel-corte-caja.dto';
import { FilterCorteCajaDto } from './dto/filter-corte-caja.dto';
import { Prisma, estado_corte } from '@prisma/client';

@Injectable()
export class CortesCajaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Genera un folio único para el corte
   * Formato: COR-YYYYMMDD-XXXX
   */
  private async generarFolio(): Promise<string> {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const fechaStr = `${año}${mes}${dia}`;

    // Buscar el último folio del día
    const ultimoCorte = await this.prisma.cortes_caja.findFirst({
      where: {
        folio_corte: {
          startsWith: `COR-${fechaStr}`,
        },
      },
      orderBy: {
        folio_corte: 'desc',
      },
    });

    let consecutivo = 1;
    if (ultimoCorte) {
      const ultimoConsecutivo = parseInt(
        ultimoCorte.folio_corte.split('-')[2],
        10,
      );
      consecutivo = ultimoConsecutivo + 1;
    }

    return `COR-${fechaStr}-${String(consecutivo).padStart(4, '0')}`;
  }

  /**
   * Verifica si hay un corte abierto
   */
  private async verificarCorteAbierto(idUsuario?: number) {
    const where: Prisma.cortes_cajaWhereInput = {
      estado: estado_corte.abierto,
    };

    if (idUsuario) {
      where.id_usuario_realiza = idUsuario;
    }

    const corteAbierto = await this.prisma.cortes_caja.findFirst({
      where,
    });

    return corteAbierto;
  }

  /**
   * Obtiene el último corte cerrado para referencia
   */
  private async obtenerUltimoCorte() {
    return await this.prisma.cortes_caja.findFirst({
      where: {
        estado: estado_corte.cerrado,
      },
      orderBy: {
        fecha_hora_fin: 'desc',
      },
    });
  }

  /**
   * Abre un nuevo corte de caja
   */
  async create(createCorteCajaDto: CreateCorteCajaDto) {
    // Verificar que no haya un corte abierto
    const corteAbierto = await this.verificarCorteAbierto();
    if (corteAbierto) {
      throw new ConflictException(
        `Ya existe un corte abierto con folio ${corteAbierto.folio_corte}. Debe cerrarlo antes de abrir uno nuevo.`,
      );
    }

    // Verificar que el tipo de corte existe
    const tipoCorte = await this.prisma.tipos_corte.findUnique({
      where: { id_tipo_corte: createCorteCajaDto.id_tipo_corte },
    });

    if (!tipoCorte) {
      throw new NotFoundException(
        `Tipo de corte con ID ${createCorteCajaDto.id_tipo_corte} no encontrado`,
      );
    }

    // Verificar que el usuario existe
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: createCorteCajaDto.id_usuario_realiza },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${createCorteCajaDto.id_usuario_realiza} no encontrado`,
      );
    }

    // Obtener el último corte para referencia
    const ultimoCorte = await this.obtenerUltimoCorte();

    // Generar folio
    const folio = await this.generarFolio();

    // Crear el corte
    try {
      const corte = await this.prisma.cortes_caja.create({
        data: {
          folio_corte: folio,
          id_tipo_corte: createCorteCajaDto.id_tipo_corte,
          id_usuario_realiza: createCorteCajaDto.id_usuario_realiza,
          fecha_hora_inicio: new Date(),
          fecha_hora_fin: new Date(), // Se actualizará al cerrar
          fondo_caja_inicial: createCorteCajaDto.fondo_caja_inicial
            ? new Prisma.Decimal(createCorteCajaDto.fondo_caja_inicial)
            : new Prisma.Decimal(0),
          observaciones: createCorteCajaDto.observaciones,
          estado: estado_corte.abierto,
          id_corte_anterior: ultimoCorte?.id_corte,
        },
        include: {
          tipos_corte: true,
          usuarios_cortes_caja_id_usuario_realizaTousuarios: {
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
        },
      });

      return corte;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un corte con ese folio');
      }
      throw error;
    }
  }

  /**
   * Calcula totales del corte desde los pagos
   */
  private async calcularTotalesCorte(fechaInicio: Date, fechaFin: Date) {
    // Obtener todos los pagos completados en el rango de fechas
    const pagos = await this.prisma.pagos.findMany({
      where: {
        fecha_hora_pago: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        estado: {
          in: ['completado', 'pendiente'],
        },
      },
      include: {
        metodos_pago: true,
      },
    });

    // Calcular totales por método de pago
    const totales = {
      total_ventas_sistema: 0,
      total_efectivo_sistema: 0,
      total_tarjeta_sistema: 0,
      total_otros_sistema: 0,
      numero_transacciones: pagos.length,
    };

    pagos.forEach((pago) => {
      const monto = Number(pago.monto);
      totales.total_ventas_sistema += monto;

      const metodoPago = pago.metodos_pago.nombre.toLowerCase();

      if (metodoPago.includes('efectivo')) {
        totales.total_efectivo_sistema += monto;
      } else if (
        metodoPago.includes('tarjeta') ||
        metodoPago.includes('card')
      ) {
        totales.total_tarjeta_sistema += monto;
      } else {
        totales.total_otros_sistema += monto;
      }
    });

    return totales;
  }

  /**
   * Cierra un corte de caja
   */
  async close(id: number, closeCorteCajaDto: CloseCorteCajaDto) {
    const corte = await this.findOne(id);

    // Validar que el corte esté abierto
    if (corte.estado !== estado_corte.abierto) {
      throw new BadRequestException('Solo se pueden cerrar cortes abiertos');
    }

    // Validar usuario autorizador
    const usuarioAutoriza = await this.prisma.usuarios.findUnique({
      where: { id_usuario: closeCorteCajaDto.id_usuario_autoriza },
    });

    if (!usuarioAutoriza) {
      throw new NotFoundException(
        `Usuario autorizador con ID ${closeCorteCajaDto.id_usuario_autoriza} no encontrado`,
      );
    }

    // Calcular totales desde los pagos
    const fechaFin = new Date();
    const totales = await this.calcularTotalesCorte(
      corte.fecha_hora_inicio,
      fechaFin,
    );

    // Calcular diferencia de efectivo
    const efectivoContado = Number(closeCorteCajaDto.efectivo_contado);
    const efectivoDiferencia = efectivoContado - totales.total_efectivo_sistema;

    // Actualizar pagos con el ID del corte
    await this.prisma.pagos.updateMany({
      where: {
        fecha_hora_pago: {
          gte: corte.fecha_hora_inicio,
          lte: fechaFin,
        },
        estado: {
          in: ['completado', 'pendiente'],
        },
        id_corte_caja: null,
      },
      data: {
        id_corte_caja: id,
      },
    });

    // Cerrar el corte
    return await this.prisma.cortes_caja.update({
      where: { id_corte: id },
      data: {
        id_usuario_autoriza: closeCorteCajaDto.id_usuario_autoriza,
        fecha_hora_fin: fechaFin,
        total_ventas_sistema: new Prisma.Decimal(totales.total_ventas_sistema),
        total_efectivo_sistema: new Prisma.Decimal(
          totales.total_efectivo_sistema,
        ),
        total_tarjeta_sistema: new Prisma.Decimal(
          totales.total_tarjeta_sistema,
        ),
        total_otros_sistema: new Prisma.Decimal(totales.total_otros_sistema),
        efectivo_contado: new Prisma.Decimal(efectivoContado),
        efectivo_diferencia: new Prisma.Decimal(efectivoDiferencia),
        fondo_caja_final: closeCorteCajaDto.fondo_caja_final
          ? new Prisma.Decimal(closeCorteCajaDto.fondo_caja_final)
          : new Prisma.Decimal(0),
        retiros_efectivo: closeCorteCajaDto.retiros_efectivo
          ? new Prisma.Decimal(closeCorteCajaDto.retiros_efectivo)
          : new Prisma.Decimal(0),
        gastos_caja: closeCorteCajaDto.gastos_caja
          ? new Prisma.Decimal(closeCorteCajaDto.gastos_caja)
          : new Prisma.Decimal(0),
        numero_transacciones: totales.numero_transacciones,
        observaciones: closeCorteCajaDto.observaciones || corte.observaciones,
        estado: estado_corte.cerrado,
      },
      include: {
        tipos_corte: true,
        usuarios_cortes_caja_id_usuario_realizaTousuarios: {
          select: {
            username: true,
            personas: true,
          },
        },
        usuarios_cortes_caja_id_usuario_autorizaTousuarios: {
          select: {
            username: true,
            personas: true,
          },
        },
        _count: {
          select: {
            pagos: true,
          },
        },
      },
    });
  }

  async findAll(filters?: FilterCorteCajaDto) {
    const where: Prisma.cortes_cajaWhereInput = {};

    if (filters?.id_tipo_corte) {
      where.id_tipo_corte = filters.id_tipo_corte;
    }

    if (filters?.id_usuario_realiza) {
      where.id_usuario_realiza = filters.id_usuario_realiza;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.folio_corte) {
      where.folio_corte = {
        contains: filters.folio_corte,
        mode: 'insensitive',
      };
    }

    // Filtro de rango de fechas
    if (filters?.fecha_desde || filters?.fecha_hasta) {
      where.fecha_hora_inicio = {};

      if (filters.fecha_desde) {
        where.fecha_hora_inicio.gte = new Date(filters.fecha_desde);
      }

      if (filters.fecha_hasta) {
        const fechaHasta = new Date(filters.fecha_hasta);
        fechaHasta.setHours(23, 59, 59, 999);
        where.fecha_hora_inicio.lte = fechaHasta;
      }
    }

    return await this.prisma.cortes_caja.findMany({
      where,
      include: {
        tipos_corte: true,
        usuarios_cortes_caja_id_usuario_realizaTousuarios: {
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
        usuarios_cortes_caja_id_usuario_autorizaTousuarios: {
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
            pagos: true,
          },
        },
      },
      orderBy: {
        fecha_hora_inicio: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const corte = await this.prisma.cortes_caja.findUnique({
      where: { id_corte: id },
      include: {
        tipos_corte: true,
        usuarios_cortes_caja_id_usuario_realizaTousuarios: {
          select: {
            username: true,
            personas: true,
          },
        },
        usuarios_cortes_caja_id_usuario_autorizaTousuarios: {
          select: {
            username: true,
            personas: true,
          },
        },
        pagos: {
          include: {
            metodos_pago: true,
            ordenes: {
              select: {
                folio: true,
              },
            },
          },
        },
        cortes_caja: {
          select: {
            folio_corte: true,
            fecha_hora_fin: true,
          },
        },
      },
    });

    if (!corte) {
      throw new NotFoundException(`Corte de caja con ID ${id} no encontrado`);
    }

    return corte;
  }

  async findCorteAbierto() {
    const corte = await this.verificarCorteAbierto();

    if (!corte) {
      return null;
    }

    return await this.findOne(corte.id_corte);
  }

  async cancel(id: number, cancelCorteCajaDto: CancelCorteCajaDto) {
    const corte = await this.findOne(id);

    if (corte.estado === estado_corte.cancelado) {
      throw new BadRequestException('El corte ya está cancelado');
    }

    if (corte.estado === estado_corte.cerrado) {
      throw new BadRequestException(
        'No se puede cancelar un corte cerrado. Debe crear un ajuste.',
      );
    }

    // Desvincular pagos asociados
    await this.prisma.pagos.updateMany({
      where: { id_corte_caja: id },
      data: { id_corte_caja: null },
    });

    return await this.prisma.cortes_caja.update({
      where: { id_corte: id },
      data: {
        estado: estado_corte.cancelado,
        observaciones: cancelCorteCajaDto.observaciones,
      },
    });
  }
}
