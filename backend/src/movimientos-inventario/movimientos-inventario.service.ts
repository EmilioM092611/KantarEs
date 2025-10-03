import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { FilterMovimientoDto } from './dto/filter-movimiento.dto';
import { Prisma, afecta_inventario } from '@prisma/client';

@Injectable()
export class MovimientosInventarioService {
  constructor(private prisma: PrismaService) {}

  /**
   * Actualiza el stock según el tipo de movimiento
   */
  private async actualizarStock(
    idProducto: number,
    cantidad: number,
    afectaInventario: afecta_inventario,
  ) {
    const inventario = await this.prisma.inventario.findUnique({
      where: { id_producto: idProducto },
    });

    if (!inventario) {
      throw new NotFoundException(
        `No existe inventario para el producto ${idProducto}`,
      );
    }

    const stockActual = Number(inventario.stock_actual);
    let nuevoStock: number;

    switch (afectaInventario) {
      case 'suma':
        nuevoStock = stockActual + cantidad;
        break;
      case 'resta':
        nuevoStock = stockActual - cantidad;
        if (nuevoStock < 0) {
          throw new BadRequestException(
            `Stock insuficiente. Stock actual: ${stockActual}, cantidad a restar: ${cantidad}`,
          );
        }
        break;
      case 'ajuste':
        // En ajuste, la cantidad ES el nuevo stock
        nuevoStock = cantidad;
        break;
      default:
        throw new BadRequestException('Tipo de afectación no válido');
    }

    await this.prisma.inventario.update({
      where: { id_producto: idProducto },
      data: {
        stock_actual: new Prisma.Decimal(nuevoStock),
        fecha_ultimo_inventario: new Date(),
      },
    });

    return {
      stock_anterior: stockActual,
      stock_nuevo: nuevoStock,
      diferencia: nuevoStock - stockActual,
    };
  }

  async create(createMovimientoDto: CreateMovimientoDto) {
    // Validar tipo de movimiento
    const tipoMovimiento = await this.prisma.tipos_movimiento.findUnique({
      where: { id_tipo_movimiento: createMovimientoDto.id_tipo_movimiento },
    });

    if (!tipoMovimiento) {
      throw new NotFoundException(
        `Tipo de movimiento ${createMovimientoDto.id_tipo_movimiento} no encontrado`,
      );
    }

    // Validar producto
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: createMovimientoDto.id_producto },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto ${createMovimientoDto.id_producto} no encontrado`,
      );
    }

    if (!producto.es_inventariable) {
      throw new BadRequestException(
        'El producto no es inventariable, no se puede registrar movimiento',
      );
    }

    // Validar usuario
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: createMovimientoDto.id_usuario },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario ${createMovimientoDto.id_usuario} no encontrado`,
      );
    }

    // Actualizar stock
    const cambioStock = await this.actualizarStock(
      createMovimientoDto.id_producto,
      Number(createMovimientoDto.cantidad),
      tipoMovimiento.afecta_inventario,
    );

    // Crear movimiento
    const movimiento = await this.prisma.movimientos_inventario.create({
      data: {
        id_tipo_movimiento: createMovimientoDto.id_tipo_movimiento,
        id_producto: createMovimientoDto.id_producto,
        id_usuario: createMovimientoDto.id_usuario,
        cantidad: new Prisma.Decimal(createMovimientoDto.cantidad),
        id_unidad_medida: createMovimientoDto.id_unidad_medida,
        fecha_movimiento: new Date(),
        id_compra: createMovimientoDto.id_compra,
        id_orden: createMovimientoDto.id_orden,
        lote: createMovimientoDto.lote,
        fecha_caducidad: createMovimientoDto.fecha_caducidad
          ? new Date(createMovimientoDto.fecha_caducidad)
          : null,
        costo_unitario: createMovimientoDto.costo_unitario
          ? new Prisma.Decimal(createMovimientoDto.costo_unitario)
          : null,
        observaciones: createMovimientoDto.observaciones,
        id_movimiento_referencia: createMovimientoDto.id_movimiento_referencia,
      },
      include: {
        tipos_movimiento: true,
        productos: {
          select: {
            sku: true,
            nombre: true,
          },
        },
        unidades_medida: {
          select: {
            nombre: true,
            abreviatura: true,
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

    return {
      ...movimiento,
      cambio_stock: cambioStock,
    };
  }

  async findAll(filters?: FilterMovimientoDto) {
    const where: Prisma.movimientos_inventarioWhereInput = {};

    if (filters?.id_producto) {
      where.id_producto = filters.id_producto;
    }

    if (filters?.id_tipo_movimiento) {
      where.id_tipo_movimiento = filters.id_tipo_movimiento;
    }

    if (filters?.id_usuario) {
      where.id_usuario = filters.id_usuario;
    }

    if (filters?.id_compra) {
      where.id_compra = filters.id_compra;
    }

    if (filters?.id_orden) {
      where.id_orden = filters.id_orden;
    }

    if (filters?.lote) {
      where.lote = {
        contains: filters.lote,
        mode: 'insensitive',
      };
    }

    if (filters?.afecta !== undefined) {
      where.tipos_movimiento = {
        afecta_inventario: filters.afecta,
      };
    }

    if (filters?.fecha_desde || filters?.fecha_hasta) {
      where.fecha_movimiento = {};

      if (filters.fecha_desde) {
        where.fecha_movimiento.gte = new Date(filters.fecha_desde);
      }

      if (filters.fecha_hasta) {
        const fechaHasta = new Date(filters.fecha_hasta);
        fechaHasta.setHours(23, 59, 59, 999);
        where.fecha_movimiento.lte = fechaHasta;
      }
    }

    return await this.prisma.movimientos_inventario.findMany({
      where,
      include: {
        tipos_movimiento: true,
        productos: {
          select: {
            sku: true,
            nombre: true,
            unidades_medida: {
              select: {
                abreviatura: true,
              },
            },
          },
        },
        unidades_medida: {
          select: {
            nombre: true,
            abreviatura: true,
          },
        },
        usuarios: {
          select: {
            username: true,
          },
        },
        compras: {
          select: {
            folio_compra: true,
          },
        },
        ordenes: {
          select: {
            folio: true,
          },
        },
      },
      orderBy: {
        fecha_movimiento: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const movimiento = await this.prisma.movimientos_inventario.findUnique({
      where: { id_movimiento: id },
      include: {
        tipos_movimiento: true,
        productos: {
          select: {
            sku: true,
            nombre: true,
            descripcion: true,
          },
        },
        unidades_medida: true,
        usuarios: {
          select: {
            username: true,
            personas: true,
          },
        },
        compras: {
          select: {
            folio_compra: true,
            proveedores: {
              select: {
                razon_social: true,
              },
            },
          },
        },
        ordenes: {
          select: {
            folio: true,
          },
        },
        movimientos_inventario: {
          select: {
            id_movimiento: true,
            fecha_movimiento: true,
            cantidad: true,
          },
        },
      },
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }

    return movimiento;
  }

  async findByProducto(idProducto: number) {
    return await this.prisma.movimientos_inventario.findMany({
      where: { id_producto: idProducto },
      include: {
        tipos_movimiento: true,
        unidades_medida: {
          select: {
            abreviatura: true,
          },
        },
        usuarios: {
          select: {
            username: true,
          },
        },
        compras: {
          select: {
            folio_compra: true,
          },
        },
        ordenes: {
          select: {
            folio: true,
          },
        },
      },
      orderBy: {
        fecha_movimiento: 'desc',
      },
      take: 50, // Últimos 50 movimientos
    });
  }

  async getResumenPorTipo(fechaInicio?: Date, fechaFin?: Date) {
    const where: Prisma.movimientos_inventarioWhereInput = {};

    if (fechaInicio || fechaFin) {
      where.fecha_movimiento = {};
      if (fechaInicio) where.fecha_movimiento.gte = fechaInicio;
      if (fechaFin) where.fecha_movimiento.lte = fechaFin;
    }

    const movimientos = await this.prisma.movimientos_inventario.groupBy({
      by: ['id_tipo_movimiento'],
      where,
      _count: {
        id_movimiento: true,
      },
      _sum: {
        cantidad: true,
      },
    });

    // Obtener nombres de tipos
    const tipos = await this.prisma.tipos_movimiento.findMany();

    return movimientos.map((mov) => {
      const tipo = tipos.find(
        (t) => t.id_tipo_movimiento === mov.id_tipo_movimiento,
      );
      return {
        tipo: tipo?.nombre || 'Desconocido',
        afecta_inventario: tipo?.afecta_inventario,
        total_movimientos: mov._count.id_movimiento,
        cantidad_total: Number(mov._sum.cantidad || 0),
      };
    });
  }

  async getMovimientosRecientes(limite: number = 20) {
    return await this.prisma.movimientos_inventario.findMany({
      take: limite,
      include: {
        tipos_movimiento: {
          select: {
            nombre: true,
            afecta_inventario: true,
          },
        },
        productos: {
          select: {
            sku: true,
            nombre: true,
          },
        },
        usuarios: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        fecha_movimiento: 'desc',
      },
    });
  }
}
