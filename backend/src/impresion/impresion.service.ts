/* eslint-disable @typescript-eslint/no-unsafe-argument */
// backend/src/impresion/impresion.service.ts

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigurarImpresoraDto } from './dto/configurar-impresora.dto';
import { ImprimirComandaDto } from './dto/imprimir.dto';
import { ImprimirTicketDto } from './dto/imprimir.dto';
import { ImprimirCorteDto } from './dto/imprimir.dto';
import {
  TipoDocumento,
  EstadoTrabajo,
  TrabajoImpresion,
} from './interfaces/impresion.interface';
import { ComandaTemplate } from './templates/comanda.template';
import { TicketTemplate } from './templates/ticket.template';

@Injectable()
export class ImpresionService {
  private readonly logger = new Logger(ImpresionService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('impresion') private impresionQueue: Queue,
  ) {}

  // ==================== GESTIÓN DE IMPRESORAS ====================

  async crearImpresora(dto: ConfigurarImpresoraDto) {
    const impresora = await this.prisma.impresoras.create({
      data: {
        nombre: dto.nombre,
        tipo: dto.tipo,
        tipo_conexion: dto.tipo_conexion,
        ip_address: dto.ip_address,
        puerto: dto.puerto,
        ruta_usb: dto.ruta_usb,
        mac_address: dto.mac_address,
        estacion: dto.estacion,
        ancho_papel: dto.ancho_papel,
        auto_corte: dto.auto_corte,
        auto_imprimir: dto.auto_imprimir,
        copias: dto.copias,
        template_comanda: dto.template_comanda || 'default',
        template_ticket: dto.template_ticket || 'default',
        activa: dto.activa,
      },
    });

    this.logger.log(
      `Impresora creada: ${impresora.nombre} [ID: ${impresora.id_impresora}]`,
    );
    return impresora;
  }

  async obtenerImpresoras(estacion?: string) {
    const where = estacion ? { estacion, activa: true } : { activa: true };

    return this.prisma.impresoras.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerImpresoraPorId(id_impresora: number) {
    const impresora = await this.prisma.impresoras.findUnique({
      where: { id_impresora },
    });

    if (!impresora) {
      throw new NotFoundException('Impresora no encontrada');
    }

    return impresora;
  }

  async actualizarImpresora(
    id_impresora: number,
    dto: Partial<ConfigurarImpresoraDto>,
  ) {
    await this.obtenerImpresoraPorId(id_impresora);

    return this.prisma.impresoras.update({
      where: { id_impresora },
      data: dto,
    });
  }

  async eliminarImpresora(id_impresora: number) {
    await this.obtenerImpresoraPorId(id_impresora);

    return this.prisma.impresoras.delete({
      where: { id_impresora },
    });
  }

  async verificarConexion(id_impresora: number) {
    const impresora = await this.obtenerImpresoraPorId(id_impresora);

    // Simulación de verificación
    const enLinea = Math.random() > 0.2;

    await this.prisma.impresoras.update({
      where: { id_impresora },
      data: {
        en_linea: enLinea,
        ultimo_ping: new Date(),
      },
    });

    return {
      id_impresora,
      nombre: impresora.nombre,
      en_linea: enLinea,
      ultimo_ping: new Date(),
    };
  }

  // ==================== IMPRESIÓN ====================

  async imprimirComanda(dto: ImprimirComandaDto, id_usuario: number) {
    // Obtener orden
    const orden = await this.prisma.ordenes.findUnique({
      where: { id_orden: dto.id_orden },
      include: {
        sesiones_mesa: {
          include: {
            mesas: {
              select: {
                numero_mesa: true,
              },
            },
          },
        },
        usuarios: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Obtener detalles
    const detalles = await this.prisma.orden_detalle.findMany({
      where: { id_orden: dto.id_orden },
      include: {
        productos: {
          select: {
            nombre: true,
          },
        },
      },
    });

    // Determinar impresora
    let impresora;
    if (dto.id_impresora) {
      impresora = await this.obtenerImpresoraPorId(dto.id_impresora);
    } else {
      const impresoras = await this.obtenerImpresoras('cocina');
      if (impresoras.length === 0) {
        throw new BadRequestException(
          'No hay impresoras configuradas para cocina',
        );
      }
      impresora = impresoras[0];
    }

    // Generar contenido de la comanda
    const contenido = ComandaTemplate.generar({
      numero_orden: orden.folio,
      mesa:
        orden.sesiones_mesa?.mesas?.numero_mesa?.toString() || 'Para llevar',
      mesero: orden.usuarios?.username || 'Desconocido',
      fecha_hora: orden.fecha_hora_orden,
      items: detalles.map((detalle) => ({
        cantidad: Number(detalle.cantidad),
        nombre: detalle.productos.nombre,
        notas: detalle.notas_especiales || undefined,
      })),
      notas: orden.observaciones || undefined,
    });

    // Crear trabajo de impresión
    const trabajo = await this.crearTrabajo({
      id_impresora: impresora.id_impresora,
      tipo_documento: TipoDocumento.COMANDA,
      contenido,
      id_orden: orden.id_orden,
      id_usuario,
    });

    // Agregar a cola de impresión
    await this.impresionQueue.add('imprimir', {
      id_trabajo: trabajo.id_trabajo,
      id_impresora: impresora.id_impresora,
      copias: impresora.copias,
    });

    this.logger.log(
      `Comanda en cola: Orden ${orden.folio} → ${impresora.nombre}`,
    );

    return {
      id_trabajo: trabajo.id_trabajo,
      impresora: impresora.nombre,
      estado: trabajo.estado,
    };
  }

  async imprimirTicket(dto: ImprimirTicketDto, id_usuario: number) {
    // Obtener orden
    const orden = await this.prisma.ordenes.findUnique({
      where: { id_orden: dto.id_orden },
      include: {
        sesiones_mesa: {
          include: {
            mesas: {
              select: {
                numero_mesa: true,
              },
            },
          },
        },
        usuarios: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Obtener detalles
    const detalles = await this.prisma.orden_detalle.findMany({
      where: { id_orden: dto.id_orden },
      include: {
        productos: {
          select: {
            nombre: true,
          },
        },
      },
    });

    // Obtener método de pago
    const pago = await this.prisma.pagos.findFirst({
      where: { id_orden: dto.id_orden },
      include: {
        metodos_pago: {
          select: { nombre: true },
        },
      },
    });

    // Determinar impresora de caja
    let impresora;
    if (dto.id_impresora) {
      impresora = await this.obtenerImpresoraPorId(dto.id_impresora);
    } else {
      const impresoras = await this.obtenerImpresoras('caja');
      if (impresoras.length === 0) {
        throw new BadRequestException(
          'No hay impresoras configuradas para caja',
        );
      }
      impresora = impresoras[0];
    }

    // Generar contenido del ticket
    const contenido = TicketTemplate.generar({
      numero_orden: orden.folio,
      fecha_hora: orden.fecha_hora_orden,
      mesa: orden.sesiones_mesa?.mesas?.numero_mesa?.toString(),
      mesero: orden.usuarios?.username || 'Desconocido',
      items: detalles.map((detalle) => ({
        cantidad: Number(detalle.cantidad),
        nombre: detalle.productos.nombre,
        precio_unitario: Number(detalle.precio_unitario),
        subtotal: Number(detalle.subtotal),
      })),
      subtotal: Number(orden.subtotal || 0),
      descuento: Number(orden.descuento_monto || 0),
      impuestos: Number(orden.iva_monto || 0) + Number(orden.ieps_monto || 0),
      propina: Number(orden.propina || 0),
      total: Number(orden.total || 0),
      metodo_pago: pago?.metodos_pago?.nombre || 'Pendiente',
      notas: orden.observaciones || undefined,
    });

    // Crear trabajo
    const trabajo = await this.crearTrabajo({
      id_impresora: impresora.id_impresora,
      tipo_documento: TipoDocumento.TICKET,
      contenido,
      id_orden: orden.id_orden,
      id_usuario,
    });

    // Agregar a cola
    await this.impresionQueue.add('imprimir', {
      id_trabajo: trabajo.id_trabajo,
      id_impresora: impresora.id_impresora,
      copias: 1,
    });

    this.logger.log(
      `Ticket en cola: Orden ${orden.folio} → ${impresora.nombre}`,
    );

    return {
      id_trabajo: trabajo.id_trabajo,
      impresora: impresora.nombre,
      estado: trabajo.estado,
    };
  }

  async imprimirCorte(dto: ImprimirCorteDto, id_usuario: number) {
    const corte = await this.prisma.cortes_caja.findUnique({
      where: { id_corte: dto.id_corte },
      include: {
        usuarios_cortes_caja_id_usuario_realizaTousuarios: {
          select: { username: true },
        },
      },
    });

    if (!corte) {
      throw new NotFoundException('Corte de caja no encontrado');
    }

    // Determinar impresora
    let impresora;
    if (dto.id_impresora) {
      impresora = await this.obtenerImpresoraPorId(dto.id_impresora);
    } else {
      const impresoras = await this.obtenerImpresoras('caja');
      if (impresoras.length === 0) {
        throw new BadRequestException(
          'No hay impresoras configuradas para caja',
        );
      }
      impresora = impresoras[0];
    }

    // Generar contenido del corte
    const contenido = this.generarContenidoCorte(
      corte,
      corte.usuarios_cortes_caja_id_usuario_realizaTousuarios?.username ||
        'Desconocido',
    );

    // Crear trabajo
    const trabajo = await this.crearTrabajo({
      id_impresora: impresora.id_impresora,
      tipo_documento: TipoDocumento.CORTE,
      contenido,
      id_corte: corte.id_corte,
      id_usuario,
    });

    // Agregar a cola
    await this.impresionQueue.add('imprimir', {
      id_trabajo: trabajo.id_trabajo,
      id_impresora: impresora.id_impresora,
      copias: impresora.copias,
    });

    this.logger.log(
      `Corte en cola: ${corte.folio_corte} → ${impresora.nombre}`,
    );

    return {
      id_trabajo: trabajo.id_trabajo,
      impresora: impresora.nombre,
      estado: trabajo.estado,
    };
  }

  // ==================== TRABAJOS DE IMPRESIÓN ====================

  private async crearTrabajo(data: Partial<TrabajoImpresion>) {
    if (!data.tipo_documento || !data.contenido) {
      throw new BadRequestException(
        'Tipo de documento y contenido son requeridos',
      );
    }

    return this.prisma.trabajos_impresion.create({
      data: {
        id_impresora: data.id_impresora!,
        tipo_documento: data.tipo_documento,
        contenido: data.contenido,
        formato: data.formato || 'ESC_POS',
        id_orden: data.id_orden,
        id_corte: data.id_corte,
        id_usuario: data.id_usuario,
        estado: EstadoTrabajo.PENDIENTE,
        intentos: 0,
        max_intentos: 3,
      },
    });
  }

  async obtenerTrabajos(limit: number = 50, offset: number = 0) {
    return this.prisma.trabajos_impresion.findMany({
      take: limit,
      skip: offset,
      orderBy: { fecha_creacion: 'desc' },
      include: {
        impresoras: true,
        usuarios: {
          select: {
            id_usuario: true,
            username: true,
          },
        },
      },
    });
  }

  async obtenerTrabajoPorId(id_trabajo: number) {
    const trabajo = await this.prisma.trabajos_impresion.findUnique({
      where: { id_trabajo },
      include: {
        impresoras: true,
      },
    });

    if (!trabajo) {
      throw new NotFoundException('Trabajo de impresión no encontrado');
    }

    return trabajo;
  }

  async actualizarEstadoTrabajo(
    id_trabajo: number,
    estado: EstadoTrabajo,
    error_mensaje?: string,
  ) {
    const data: any = {
      estado,
      fecha_proceso:
        estado === EstadoTrabajo.IMPRIMIENDO ? new Date() : undefined,
      fecha_completado:
        estado === EstadoTrabajo.COMPLETADO ? new Date() : undefined,
      error_mensaje,
    };

    if (estado === EstadoTrabajo.ERROR) {
      const trabajo = await this.obtenerTrabajoPorId(id_trabajo);
      data.intentos = (trabajo.intentos || 0) + 1;
    }

    return this.prisma.trabajos_impresion.update({
      where: { id_trabajo },
      data,
    });
  }

  async reintentarTrabajo(id_trabajo: number) {
    const trabajo = await this.obtenerTrabajoPorId(id_trabajo);

    if ((trabajo.intentos || 0) >= (trabajo.max_intentos || 3)) {
      throw new BadRequestException('Se alcanzó el máximo de intentos');
    }

    await this.actualizarEstadoTrabajo(id_trabajo, EstadoTrabajo.PENDIENTE);

    await this.impresionQueue.add('imprimir', {
      id_trabajo: trabajo.id_trabajo,
      id_impresora: trabajo.id_impresora,
      copias: 1,
    });

    return { message: 'Trabajo agregado a la cola nuevamente' };
  }

  // ==================== ESTADÍSTICAS ====================

  async obtenerEstadisticas() {
    const [total, pendientes, completados, errores, porTipo] =
      await Promise.all([
        this.prisma.trabajos_impresion.count(),
        this.prisma.trabajos_impresion.count({
          where: { estado: EstadoTrabajo.PENDIENTE },
        }),
        this.prisma.trabajos_impresion.count({
          where: { estado: EstadoTrabajo.COMPLETADO },
        }),
        this.prisma.trabajos_impresion.count({
          where: { estado: EstadoTrabajo.ERROR },
        }),
        this.prisma.trabajos_impresion.groupBy({
          by: ['tipo_documento'],
          _count: { tipo_documento: true },
        }),
      ]);

    return {
      total,
      pendientes,
      completados,
      errores,
      por_tipo: porTipo,
      tasa_exito: total > 0 ? ((completados / total) * 100).toFixed(2) : 0,
    };
  }

  // ==================== HELPERS ====================

  private generarContenidoCorte(corte: any, username: string): string {
    return `
================================================
            CORTE DE CAJA
================================================
Folio: ${corte.folio_corte}
Fecha: ${new Date(corte.fecha_hora_inicio).toLocaleString('es-MX')}
Usuario: ${username}

------------------------------------------------
FONDO INICIAL:           $${Number(corte.fondo_caja_inicial || 0).toFixed(2)}
VENTAS EN EFECTIVO:      $${Number(corte.total_efectivo_sistema || 0).toFixed(2)}
VENTAS TARJETA:          $${Number(corte.total_tarjeta_sistema || 0).toFixed(2)}
OTROS PAGOS:             $${Number(corte.total_otros_sistema || 0).toFixed(2)}
EFECTIVO CONTADO:        $${Number(corte.efectivo_contado || 0).toFixed(2)}
DIFERENCIA:              $${Number(corte.efectivo_diferencia || 0).toFixed(2)}
RETIROS:                 $${Number(corte.retiros_efectivo || 0).toFixed(2)}
GASTOS:                  $${Number(corte.gastos_caja || 0).toFixed(2)}
------------------------------------------------
TOTAL VENTAS:            $${Number(corte.total_ventas_sistema || 0).toFixed(2)}
TRANSACCIONES:           ${corte.numero_transacciones || 0}
------------------------------------------------

${corte.observaciones ? `Observaciones: ${corte.observaciones}\n` : ''}

================================================
    `;
  }
}
