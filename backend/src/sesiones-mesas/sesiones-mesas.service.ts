/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbrirSesionDto } from './dto/abrir-sesion.dto';
import { CerrarSesionDto } from './dto/cerrar-sesion.dto';
import { ActualizarSesionDto } from './dto/actualizar-sesion.dto';
import { TransferirMesaDto } from './dto/transferir-mesa.dto';
import { QuerySesionesDto } from './dto/query-sesiones.dto';
import { estado_sesion } from '@prisma/client';

@Injectable()
export class SesionesMesaService {
  constructor(private readonly prisma: PrismaService) {}

  async abrirSesion(abrirSesionDto: AbrirSesionDto, userId: number) {
    // Verificar que la mesa existe y está activa
    const mesa = await this.prisma.mesas.findFirst({
      where: {
        id_mesa: abrirSesionDto.id_mesa,
        activa: true,
      },
      include: {
        sesiones_mesa: {
          where: { estado: 'abierta' },
        },
      },
    });

    if (!mesa) {
      throw new NotFoundException('Mesa no encontrada o inactiva');
    }

    // Verificar que no haya sesión activa
    if (mesa.sesiones_mesa.length > 0) {
      throw new ConflictException('La mesa ya tiene una sesión activa');
    }

    // Verificar capacidad
    if (abrirSesionDto.numero_comensales > mesa.capacidad_personas) {
      throw new BadRequestException(
        `El número de comensales (${abrirSesionDto.numero_comensales}) ` +
          `excede la capacidad de la mesa (${mesa.capacidad_personas})`,
      );
    }

    // Iniciar transacción para crear sesión y actualizar mesa
    return this.prisma.$transaction(async (tx) => {
      // Crear sesión con relación correcta
      const sesion = await tx.sesiones_mesa.create({
        data: {
          fecha_hora_apertura: new Date(),
          numero_comensales: abrirSesionDto.numero_comensales,
          nombre_cliente: abrirSesionDto.nombre_cliente,
          observaciones: abrirSesionDto.observaciones,
          estado: 'abierta',
          // Conectar con la mesa existente
          mesas: {
            connect: { id_mesa: abrirSesionDto.id_mesa },
          },
          // Conectar con el usuario de apertura
          usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
            connect: { id_usuario: userId },
          },
        },
        include: {
          mesas: true,
          usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
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

      // Actualizar estado de mesa
      await tx.mesas.update({
        where: { id_mesa: abrirSesionDto.id_mesa },
        data: {
          id_estado_mesa: 2, // Ocupada
          requiere_limpieza: false,
        },
      });

      return sesion;
    });
  }

  async cerrarSesion(
    id: number,
    userId: number,
    cerrarSesionDto: CerrarSesionDto,
  ) {
    const sesion = await this.prisma.sesiones_mesa.findFirst({
      where: {
        id_sesion: id,
        estado: 'abierta',
      },
      include: {
        ordenes: {
          where: {
            estados_orden: {
              nombre: {
                notIn: ['pagada', 'cancelada'],
              },
            },
          },
        },
      },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión no encontrada o ya cerrada');
    }

    // Verificar órdenes pendientes
    if (sesion.ordenes.length > 0) {
      throw new ConflictException(
        `Existen ${sesion.ordenes.length} órdenes pendientes de pago`,
      );
    }

    // Cerrar sesión y actualizar mesa
    return this.prisma.$transaction(async (tx) => {
      const sesionCerrada = await tx.sesiones_mesa.update({
        where: { id_sesion: id },
        data: {
          estado: cerrarSesionDto.motivo_cancelacion ? 'cancelada' : 'cerrada',
          fecha_hora_cierre: new Date(),
          id_usuario_cierre: userId,
          motivo_cancelacion: cerrarSesionDto.motivo_cancelacion,
        },
        include: {
          mesas: true,
          usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
            select: {
              username: true,
              personas: true,
            },
          },
          usuarios_sesiones_mesa_id_usuario_cierreTousuarios: {
            select: {
              username: true,
              personas: true,
            },
          },
        },
      });

      // Actualizar mesa a "por limpiar"
      await tx.mesas.update({
        where: { id_mesa: sesion.id_mesa },
        data: {
          id_estado_mesa: 4, // Por limpiar
          requiere_limpieza: true,
        },
      });

      return sesionCerrada;
    });
  }

  async findAll() {
    return this.prisma.sesiones_mesa.findMany({
      include: {
        mesas: true,
        usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
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
        usuarios_sesiones_mesa_id_usuario_cierreTousuarios: {
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
        ordenes: {
          select: {
            id_orden: true,
            folio: true,
            total: true,
            estados_orden: true,
          },
        },
      },
      orderBy: {
        fecha_hora_apertura: 'desc',
      },
    });
  }

  async findActivas() {
    return this.prisma.sesiones_mesa.findMany({
      where: {
        estado: 'abierta',
      },
      include: {
        mesas: true,
        usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
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
        ordenes: {
          where: {
            estados_orden: {
              nombre: {
                not: 'pagada',
              },
            },
          },
          select: {
            id_orden: true,
            folio: true,
            total: true,
            estados_orden: true,
          },
        },
      },
      orderBy: {
        fecha_hora_apertura: 'desc',
      },
    });
  }

  async getActivas() {
    return this.prisma.sesiones_mesa.findMany({
      where: { estado: 'abierta' },
      include: {
        mesas: {
          select: {
            numero_mesa: true,
            ubicacion: true,
            capacidad_personas: true,
          },
        },
        usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
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
        ordenes: {
          where: {
            estados_orden: {
              nombre: {
                notIn: ['cancelada'],
              },
            },
          },
          select: {
            id_orden: true,
            folio: true,
            total: true,
            estados_orden: {
              select: {
                nombre: true,
                color_hex: true,
              },
            },
          },
        },
      },
      orderBy: [{ fecha_hora_apertura: 'desc' }],
    });
  }

  async getSesionByMesa(mesaId: number) {
    const sesion = await this.prisma.sesiones_mesa.findFirst({
      where: {
        id_mesa: mesaId,
        estado: 'abierta',
      },
      include: {
        mesas: true,
        usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
          select: {
            username: true,
            personas: true,
          },
        },
        ordenes: {
          include: {
            estados_orden: true,
            orden_detalle: {
              include: {
                productos: true,
              },
            },
          },
        },
      },
    });

    if (!sesion) {
      throw new NotFoundException('No hay sesión activa para esta mesa');
    }

    return sesion;
  }

  async findOne(id: number) {
    const sesion = await this.prisma.sesiones_mesa.findUnique({
      where: { id_sesion: id },
      include: {
        mesas: true,
        usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
          select: {
            username: true,
            personas: true,
          },
        },
        usuarios_sesiones_mesa_id_usuario_cierreTousuarios: {
          select: {
            username: true,
            personas: true,
          },
        },
        ordenes: {
          include: {
            estados_orden: true,
          },
        },
      },
    });

    if (!sesion) {
      throw new NotFoundException(`Sesión con ID ${id} no encontrada`);
    }

    return sesion;
  }

  async getResumen(id: number) {
    const sesion = await this.findOne(id);

    const resumen = {
      sesion: {
        id_sesion: sesion.id_sesion,
        mesa: sesion.mesas.numero_mesa,
        fecha_apertura: sesion.fecha_hora_apertura,
        fecha_cierre: sesion.fecha_hora_cierre,
        estado: sesion.estado,
        comensales: sesion.numero_comensales ?? 1,
        cliente: sesion.nombre_cliente,
        mesero: sesion.usuarios_sesiones_mesa_id_usuario_aperturaTousuarios,
      },
      ordenes: {
        total: sesion.ordenes.length,
        pendientes: sesion.ordenes.filter(
          (o) => o.estados_orden.nombre === 'pendiente',
        ).length,
        preparando: sesion.ordenes.filter(
          (o) => o.estados_orden.nombre === 'preparando',
        ).length,
        servidas: sesion.ordenes.filter(
          (o) => o.estados_orden.nombre === 'servida',
        ).length,
        pagadas: sesion.ordenes.filter(
          (o) => o.estados_orden.nombre === 'pagada',
        ).length,
      },
      totales: {
        subtotal: sesion.ordenes.reduce(
          (acc, o) => acc + Number(o.subtotal || 0),
          0,
        ),
        descuentos: sesion.ordenes.reduce(
          (acc, o) => acc + Number(o.descuento_monto || 0),
          0,
        ),
        iva: sesion.ordenes.reduce(
          (acc, o) => acc + Number(o.iva_monto || 0),
          0,
        ),
        propinas: sesion.ordenes.reduce(
          (acc, o) => acc + Number(o.propina || 0),
          0,
        ),
        total: sesion.ordenes.reduce((acc, o) => acc + Number(o.total || 0), 0),
      },
      duracion: this.calcularDuracion(
        sesion.fecha_hora_apertura,
        sesion.fecha_hora_cierre || new Date(),
      ),
    };

    return resumen;
  }

  async actualizarComensales(id: number, numeroComensales: number) {
    const sesion = await this.findOne(id);

    if (sesion.estado !== 'abierta') {
      throw new BadRequestException(
        'Solo se pueden actualizar sesiones abiertas',
      );
    }

    // Verificar capacidad de mesa
    if (numeroComensales > sesion.mesas.capacidad_personas) {
      throw new BadRequestException(
        `El número de comensales (${numeroComensales}) excede la capacidad de la mesa (${sesion.mesas.capacidad_personas})`,
      );
    }

    return this.prisma.sesiones_mesa.update({
      where: { id_sesion: id },
      data: { numero_comensales: numeroComensales },
      include: {
        mesas: true,
      },
    });
  }

  async transferirMesa(
    id: number,
    transferirDto: TransferirMesaDto,
    userId: number,
  ) {
    const sesion = await this.findOne(id);

    if (sesion.estado !== 'abierta') {
      throw new BadRequestException(
        'Solo se pueden transferir sesiones abiertas',
      );
    }

    // Verificar mesa destino
    const mesaDestino = await this.prisma.mesas.findFirst({
      where: {
        id_mesa: transferirDto.id_mesa_destino,
        activa: true,
        id_estado_mesa: 1, // Disponible
      },
    });

    if (!mesaDestino) {
      throw new BadRequestException('Mesa destino no disponible');
    }

    const numeroComensales = sesion.numero_comensales ?? 1;

    if (mesaDestino.capacidad_personas < numeroComensales) {
      throw new BadRequestException(
        `La mesa destino no tiene capacidad suficiente para ${numeroComensales} comensales`,
      );
    }

    // Transferir en transacción
    return this.prisma.$transaction(async (tx) => {
      // Liberar mesa actual
      await tx.mesas.update({
        where: { id_mesa: sesion.id_mesa },
        data: {
          id_estado_mesa: 1, // Disponible
          requiere_limpieza: false,
        },
      });

      // Ocupar mesa destino
      await tx.mesas.update({
        where: { id_mesa: transferirDto.id_mesa_destino },
        data: {
          id_estado_mesa: 2, // Ocupada
        },
      });

      // Actualizar sesión
      return tx.sesiones_mesa.update({
        where: { id_sesion: id },
        data: {
          id_mesa: transferirDto.id_mesa_destino,
          observaciones:
            `${sesion.observaciones || ''}\n[Transferida desde mesa ${sesion.mesas.numero_mesa} por usuario ${userId}]`.trim(),
        },
        include: {
          mesas: true,
        },
      });
    });
  }

  async pausarSesion(id: number, userId: number) {
    const sesion = await this.findOne(id);

    if (sesion.estado !== 'abierta') {
      throw new BadRequestException('Solo se pueden pausar sesiones abiertas');
    }

    return this.prisma.sesiones_mesa.update({
      where: { id_sesion: id },
      data: {
        estado: 'pausada',
        observaciones:
          `${sesion.observaciones || ''}\n[Pausada por usuario ${userId}]`.trim(),
      },
      include: {
        mesas: true,
      },
    });
  }

  async reanudarSesion(id: number, userId: number) {
    const sesion = await this.findOne(id);

    if (sesion.estado !== 'pausada') {
      throw new BadRequestException(
        'Solo se pueden reanudar sesiones pausadas',
      );
    }

    return this.prisma.sesiones_mesa.update({
      where: { id_sesion: id },
      data: {
        estado: 'abierta',
        observaciones:
          `${sesion.observaciones || ''}\n[Reanudada por usuario ${userId}]`.trim(),
      },
      include: {
        mesas: true,
      },
    });
  }

  async cancelarSesion(id: number, userId: number, motivo?: string) {
    // Verificar que la sesión existe
    const sesion = await this.prisma.sesiones_mesa.findUnique({
      where: { id_sesion: id },
      include: {
        ordenes: {
          include: {
            estados_orden: true,
          },
        },
      },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión no encontrada');
    }

    // Verificar que no hay órdenes procesadas
    const ordenesActivas = sesion.ordenes.filter(
      (orden) =>
        orden.estados_orden.nombre !== 'cancelada' &&
        orden.estados_orden.nombre !== 'pagada',
    );

    if (ordenesActivas.length > 0) {
      throw new BadRequestException(
        'No se puede cancelar una sesión con órdenes activas',
      );
    }

    // Cancelar la sesión
    return this.prisma.$transaction(async (tx) => {
      // Actualizar sesión
      const sesionCancelada = await tx.sesiones_mesa.update({
        where: { id_sesion: id },
        data: {
          estado: 'cancelada',
          motivo_cancelacion: motivo || 'Cancelada por usuario',
          fecha_hora_cierre: new Date(),
          usuarios_sesiones_mesa_id_usuario_cierreTousuarios: {
            connect: { id_usuario: userId },
          },
        },
        include: {
          mesas: true,
          usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
            select: {
              username: true,
              personas: true,
            },
          },
        },
      });

      // Liberar mesa (estado disponible = 1)
      await tx.mesas.update({
        where: { id_mesa: sesion.id_mesa },
        data: {
          estados_mesa: {
            connect: { id_estado_mesa: 1 }, // Disponible
          },
          requiere_limpieza: false,
        },
      });

      return sesionCancelada;
    });
  }

  async buscar(query: QuerySesionesDto) {
    const where: any = {};

    if (query.estado) {
      where.estado = query.estado;
    }

    if (query.id_mesa) {
      where.id_mesa = query.id_mesa;
    }

    if (query.id_usuario) {
      where.OR = [
        { id_usuario_apertura: query.id_usuario },
        { id_usuario_cierre: query.id_usuario },
      ];
    }

    if (query.fecha_desde || query.fecha_hasta) {
      where.fecha_hora_apertura = {};
      if (query.fecha_desde) {
        where.fecha_hora_apertura.gte = query.fecha_desde;
      }
      if (query.fecha_hasta) {
        where.fecha_hora_apertura.lte = query.fecha_hasta;
      }
    }

    return this.prisma.sesiones_mesa.findMany({
      where,
      include: {
        mesas: {
          select: {
            numero_mesa: true,
            ubicacion: true,
          },
        },
        usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        fecha_hora_apertura: 'desc',
      },
    });
  }

  private calcularDuracion(inicio: Date, fin: Date): string {
    const diff = fin.getTime() - inicio.getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}m`;
  }
}
