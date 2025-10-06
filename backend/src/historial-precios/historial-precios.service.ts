import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistorialPrecioDto } from './dto/create-historial-precio.dto';
import { FilterHistorialPrecioDto } from './dto/filter-historial-precio.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HistorialPreciosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHistorialPrecioDto: CreateHistorialPrecioDto) {
    // Validar que el producto existe
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: createHistorialPrecioDto.id_producto },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${createHistorialPrecioDto.id_producto} no encontrado`,
      );
    }

    // Validar que el usuario existe
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: createHistorialPrecioDto.id_usuario_modifica },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${createHistorialPrecioDto.id_usuario_modifica} no encontrado`,
      );
    }

    // Validar que fecha_vigencia_fin sea posterior a fecha_vigencia_inicio
    if (
      createHistorialPrecioDto.fecha_vigencia_fin &&
      new Date(createHistorialPrecioDto.fecha_vigencia_fin) <
        new Date(createHistorialPrecioDto.fecha_vigencia_inicio)
    ) {
      throw new BadRequestException(
        'La fecha de fin de vigencia debe ser posterior a la fecha de inicio',
      );
    }

    try {
      return await this.prisma.historial_precios_producto.create({
        data: {
          ...createHistorialPrecioDto,
          fecha_cambio: new Date(),
          fecha_vigencia_inicio: new Date(
            createHistorialPrecioDto.fecha_vigencia_inicio,
          ),
          fecha_vigencia_fin: createHistorialPrecioDto.fecha_vigencia_fin
            ? new Date(createHistorialPrecioDto.fecha_vigencia_fin)
            : null,
        },
        include: {
          productos: {
            select: {
              id_producto: true,
              nombre: true,
              sku: true,
            },
          },
          usuarios: {
            select: {
              id_usuario: true,
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
    } catch (error) {
      throw new BadRequestException(
        'Error al crear el registro de historial de precio',
      );
    }
  }

  async findAll(filters: FilterHistorialPrecioDto) {
    const {
      id_producto,
      id_usuario_modifica,
      fecha_desde,
      fecha_hasta,
      page = 1,
      limit = 10,
      sortBy = 'fecha_cambio',
      sortOrder = 'desc',
    } = filters;

    const where: Prisma.historial_precios_productoWhereInput = {
      AND: [
        id_producto ? { id_producto } : {},
        id_usuario_modifica ? { id_usuario_modifica } : {},
        fecha_desde ? { fecha_cambio: { gte: new Date(fecha_desde) } } : {},
        fecha_hasta ? { fecha_cambio: { lte: new Date(fecha_hasta) } } : {},
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.historial_precios_producto.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          productos: {
            select: {
              id_producto: true,
              nombre: true,
              sku: true,
            },
          },
          usuarios: {
            select: {
              id_usuario: true,
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
      }),
      this.prisma.historial_precios_producto.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const historial = await this.prisma.historial_precios_producto.findUnique({
      where: { id_historial: id },
      include: {
        productos: {
          select: {
            id_producto: true,
            nombre: true,
            sku: true,
            precio_venta: true,
          },
        },
        usuarios: {
          select: {
            id_usuario: true,
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

    if (!historial) {
      throw new NotFoundException(
        `Registro de historial con ID ${id} no encontrado`,
      );
    }

    return historial;
  }

  async findByProducto(id_producto: number) {
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${id_producto} no encontrado`,
      );
    }

    const historial = await this.prisma.historial_precios_producto.findMany({
      where: { id_producto },
      orderBy: { fecha_cambio: 'desc' },
      include: {
        usuarios: {
          select: {
            id_usuario: true,
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
      producto: {
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        sku: producto.sku,
        precio_actual: producto.precio_venta,
      },
      historial,
      total_cambios: historial.length,
    };
  }

  async getPrecioEnFecha(id_producto: number, fecha: string) {
    const fechaBusqueda = new Date(fecha);

    const precioVigente =
      await this.prisma.historial_precios_producto.findFirst({
        where: {
          id_producto,
          fecha_vigencia_inicio: { lte: fechaBusqueda },
          OR: [
            { fecha_vigencia_fin: null },
            { fecha_vigencia_fin: { gte: fechaBusqueda } },
          ],
        },
        orderBy: { fecha_vigencia_inicio: 'desc' },
        include: {
          productos: {
            select: {
              id_producto: true,
              nombre: true,
              sku: true,
            },
          },
        },
      });

    if (!precioVigente) {
      throw new NotFoundException(
        `No se encontró precio vigente para el producto ${id_producto} en la fecha ${fecha}`,
      );
    }

    return precioVigente;
  }

  async getEstadisticasProducto(id_producto: number) {
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${id_producto} no encontrado`,
      );
    }

    const historial = await this.prisma.historial_precios_producto.findMany({
      where: { id_producto },
      orderBy: { fecha_cambio: 'asc' },
    });

    if (historial.length === 0) {
      return {
        id_producto,
        nombre: producto.nombre,
        precio_actual: Number(producto.precio_venta),
        total_cambios: 0,
        precio_minimo: Number(producto.precio_venta),
        precio_maximo: Number(producto.precio_venta),
        precio_promedio: Number(producto.precio_venta),
        variacion_total: 0,
        ultimo_cambio: null,
      };
    }

    const precios = historial.map((h) => Number(h.precio_nuevo));
    const precioMinimo = Math.min(...precios);
    const precioMaximo = Math.max(...precios);
    const precioPromedio =
      precios.reduce((sum, p) => sum + p, 0) / precios.length;

    const primerPrecio = Number(historial[0].precio_anterior);
    const ultimoPrecio = Number(historial[historial.length - 1].precio_nuevo);
    const variacionTotal = ((ultimoPrecio - primerPrecio) / primerPrecio) * 100;

    return {
      id_producto,
      nombre: producto.nombre,
      precio_actual: Number(producto.precio_venta),
      total_cambios: historial.length,
      precio_minimo: precioMinimo,
      precio_maximo: precioMaximo,
      precio_promedio: Number(precioPromedio.toFixed(2)),
      variacion_total: Number(variacionTotal.toFixed(2)),
      ultimo_cambio: historial[historial.length - 1],
    };
  }

  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.historial_precios_producto.delete({
        where: { id_historial: id },
      });
    } catch (error) {
      throw new BadRequestException(
        'Error al eliminar el registro de historial',
      );
    }
  }
}
