/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { CancelPagoDto } from './dto/cancel-pago.dto';
import { FilterPagoDto } from './dto/filter-pago.dto';
import { Prisma, estado_pago } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstadoOrdenNombre } from '../ordenes/enums/orden-estados.enum';

@Injectable()
export class PagosService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Genera un folio único para el pago
   * Formato: PAG-YYYYMMDD-XXXX
   */
  private async generarFolio(): Promise<string> {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const fechaStr = `${año}${mes}${dia}`;

    // Buscar el último folio del día
    const ultimoPago = await this.prisma.pagos.findFirst({
      where: {
        folio_pago: {
          startsWith: `PAG-${fechaStr}`,
        },
      },
      orderBy: {
        folio_pago: 'desc',
      },
    });

    let consecutivo = 1;
    if (ultimoPago) {
      const ultimoConsecutivo = parseInt(
        ultimoPago.folio_pago.split('-')[2],
        10,
      );
      consecutivo = ultimoConsecutivo + 1;
    }

    return `PAG-${fechaStr}-${String(consecutivo).padStart(4, '0')}`;
  }

  /**
   * Valida que la orden existe y puede recibir pagos
   */
  private async validarOrden(idOrden: number) {
    const orden = await this.prisma.ordenes.findUnique({
      where: { id_orden: idOrden },
      select: {
        id_orden: true,
        total: true,
        id_sesion_mesa: true,
        estados_orden: true,
        pagos: {
          where: {
            estado: {
              in: [estado_pago.pendiente, estado_pago.completado],
            },
          },
          select: {
            monto: true,
            estado: true,
          },
        },
      },
    });

    if (!orden) {
      throw new NotFoundException(`Orden con ID ${idOrden} no encontrada`);
    }

    // Calcular el total pagado
    const totalPagado = orden.pagos.reduce((sum, pago) => {
      return sum + Number(pago.monto);
    }, 0);

    const totalOrden = Number(orden.total);

    return {
      orden,
      totalOrden,
      totalPagado,
      saldoPendiente: totalOrden - totalPagado,
    };
  }

  /**
   * Valida el método de pago y sus requisitos
   */
  private async validarMetodoPago(
    idMetodoPago: number,
    createPagoDto: CreatePagoDto,
  ) {
    const metodoPago = await this.prisma.metodos_pago.findUnique({
      where: { id_metodo_pago: idMetodoPago },
    });

    if (!metodoPago) {
      throw new NotFoundException(
        `Método de pago con ID ${idMetodoPago} no encontrado`,
      );
    }

    if (!metodoPago.activo) {
      throw new BadRequestException('El método de pago no está activo');
    }

    // Validar referencia si es requerida
    if (
      metodoPago.requiere_referencia &&
      !createPagoDto.referencia_transaccion
    ) {
      throw new BadRequestException(
        'Este método de pago requiere una referencia de transacción',
      );
    }

    // Validar autorización si es requerida
    if (
      metodoPago.requiere_autorizacion &&
      !createPagoDto.numero_autorizacion
    ) {
      throw new BadRequestException(
        'Este método de pago requiere un número de autorización',
      );
    }

    return metodoPago;
  }

  async create(createPagoDto: CreatePagoDto) {
    // 1. Validar orden y obtener saldo pendiente
    const { orden, totalOrden, totalPagado, saldoPendiente } =
      await this.validarOrden(createPagoDto.id_orden);

    // 2. Validar que el monto no exceda el saldo pendiente
    const montoPago = Number(createPagoDto.monto);
    if (montoPago > saldoPendiente) {
      throw new BadRequestException(
        `El monto del pago ($${montoPago}) excede el saldo pendiente ($${saldoPendiente})`,
      );
    }

    // 3. Validar método de pago
    await this.validarMetodoPago(createPagoDto.id_metodo_pago, createPagoDto);

    // 4. Validar que el usuario existe
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: createPagoDto.id_usuario_cobra },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${createPagoDto.id_usuario_cobra} no encontrado`,
      );
    }

    // 5. Usar transacción para crear pago y verificar si orden se salda
    return await this.prisma.$transaction(async (tx) => {
      // Generar folio
      const folio = await this.generarFolio();

      // Crear el pago
      const pago = await tx.pagos.create({
        data: {
          folio_pago: folio,
          id_orden: createPagoDto.id_orden,
          id_metodo_pago: createPagoDto.id_metodo_pago,
          id_usuario_cobra: createPagoDto.id_usuario_cobra,
          monto: new Prisma.Decimal(montoPago),
          fecha_hora_pago: new Date(),
          referencia_transaccion: createPagoDto.referencia_transaccion,
          numero_autorizacion: createPagoDto.numero_autorizacion,
          ultimos_4_digitos: createPagoDto.ultimos_4_digitos,
          nombre_tarjetahabiente: createPagoDto.nombre_tarjetahabiente,
          tipo_tarjeta: createPagoDto.tipo_tarjeta,
          banco_emisor: createPagoDto.banco_emisor,
          cambio_entregado: createPagoDto.cambio_entregado
            ? new Prisma.Decimal(createPagoDto.cambio_entregado)
            : new Prisma.Decimal(0),
          estado: estado_pago.completado,
        },
        include: {
          ordenes: {
            select: {
              folio: true,
              total: true,
            },
          },
          metodos_pago: {
            select: {
              nombre: true,
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
        },
      });

      // Calcular nuevo total pagado
      const nuevoTotalPagado = totalPagado + montoPago;

      // Si la orden está completamente pagada, actualizar su estado
      if (nuevoTotalPagado >= totalOrden) {
        // Buscar el estado "pagada"
        const estadoPagada = await tx.estados_orden.findFirst({
          where: {
            nombre: {
              equals: EstadoOrdenNombre.PAGADA,
              mode: 'insensitive',
            },
          },
        });

        if (estadoPagada) {
          await tx.ordenes.update({
            where: { id_orden: createPagoDto.id_orden },
            data: {
              id_estado_orden: estadoPagada.id_estado_orden,
              updated_at: new Date(),
            },
          });

          // Emitir evento de orden pagada
          this.eventEmitter.emit('orden.pagada', {
            id_orden: orden.id_orden,
            id_sesion_mesa: orden.id_sesion_mesa,
            total: totalOrden,
            timestamp: new Date(),
          });
        }
      }

      return pago;
    });
  }

  async findAll(filters?: FilterPagoDto) {
    const where: Prisma.pagosWhereInput = {};

    if (filters?.id_orden) {
      where.id_orden = filters.id_orden;
    }

    if (filters?.id_metodo_pago) {
      where.id_metodo_pago = filters.id_metodo_pago;
    }

    if (filters?.id_usuario_cobra) {
      where.id_usuario_cobra = filters.id_usuario_cobra;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.id_corte_caja) {
      where.id_corte_caja = filters.id_corte_caja;
    }

    if (filters?.folio_pago) {
      where.folio_pago = {
        contains: filters.folio_pago,
        mode: 'insensitive',
      };
    }

    // Filtro de rango de fechas
    if (filters?.fecha_desde || filters?.fecha_hasta) {
      where.fecha_hora_pago = {};

      if (filters.fecha_desde) {
        where.fecha_hora_pago.gte = new Date(filters.fecha_desde);
      }

      if (filters.fecha_hasta) {
        const fechaHasta = new Date(filters.fecha_hasta);
        fechaHasta.setHours(23, 59, 59, 999);
        where.fecha_hora_pago.lte = fechaHasta;
      }
    }

    return await this.prisma.pagos.findMany({
      where,
      include: {
        ordenes: {
          select: {
            folio: true,
            total: true,
          },
        },
        metodos_pago: {
          select: {
            nombre: true,
            icono: true,
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
        cortes_caja: {
          select: {
            folio_corte: true,
          },
        },
      },
      orderBy: {
        fecha_hora_pago: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const pago = await this.prisma.pagos.findUnique({
      where: { id_pago: id },
      include: {
        ordenes: {
          select: {
            folio: true,
            total: true,
            sesiones_mesa: {
              select: {
                mesas: {
                  select: {
                    numero_mesa: true,
                  },
                },
              },
            },
          },
        },
        metodos_pago: true,
        usuarios: {
          select: {
            username: true,
            personas: {
              select: {
                nombre: true,
                apellido_paterno: true,
                apellido_materno: true,
              },
            },
          },
        },
        cortes_caja: {
          select: {
            folio_corte: true,
            estado: true,
          },
        },
      },
    });

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }

  async findByOrden(idOrden: number) {
    return await this.prisma.pagos.findMany({
      where: { id_orden: idOrden },
      include: {
        metodos_pago: {
          select: {
            nombre: true,
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
      },
      orderBy: {
        fecha_hora_pago: 'desc',
      },
    });
  }

  async update(id: number, updatePagoDto: UpdatePagoDto) {
    const pago = await this.findOne(id);

    // Solo se pueden actualizar pagos pendientes
    if (pago.estado !== estado_pago.pendiente) {
      throw new BadRequestException(
        'Solo se pueden actualizar pagos con estado pendiente',
      );
    }

    // No permitir actualizar si ya está en un corte cerrado
    if (pago.cortes_caja && pago.cortes_caja.estado === 'cerrado') {
      throw new BadRequestException(
        'No se puede actualizar un pago que ya está en un corte de caja cerrado',
      );
    }

    return await this.prisma.pagos.update({
      where: { id_pago: id },
      data: updatePagoDto,
    });
  }

  async cancel(id: number, cancelPagoDto: CancelPagoDto) {
    const pago = await this.findOne(id);

    // Validaciones
    if (pago.estado === estado_pago.cancelado) {
      throw new BadRequestException('El pago ya está cancelado');
    }

    if (pago.estado === estado_pago.reembolsado) {
      throw new BadRequestException('No se puede cancelar un pago reembolsado');
    }

    if (pago.cortes_caja && pago.cortes_caja.estado === 'cerrado') {
      throw new BadRequestException(
        'No se puede cancelar un pago que ya está en un corte de caja cerrado',
      );
    }

    return await this.prisma.pagos.update({
      where: { id_pago: id },
      data: {
        estado: estado_pago.cancelado,
        motivo_cancelacion: cancelPagoDto.motivo_cancelacion,
      },
    });
  }

  async getTotalByOrden(idOrden: number) {
    const result = await this.prisma.pagos.aggregate({
      where: {
        id_orden: idOrden,
        estado: {
          in: [estado_pago.pendiente, estado_pago.completado],
        },
      },
      _sum: {
        monto: true,
      },
    });

    return Number(result._sum.monto || 0);
  }

  async getReporteDiario(fecha: Date) {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    return await this.prisma.pagos.groupBy({
      by: ['id_metodo_pago', 'estado'],
      where: {
        fecha_hora_pago: {
          gte: inicioDia,
          lte: finDia,
        },
      },
      _sum: {
        monto: true,
      },
      _count: {
        id_pago: true,
      },
    });
  }
}
