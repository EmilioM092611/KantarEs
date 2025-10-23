/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { FilterPromocionDto } from './dto/filter-promocion.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PromocionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPromocionDto: CreatePromocionDto) {
    // Validar que fecha_fin sea posterior a fecha_inicio
    if (
      createPromocionDto.fecha_fin &&
      new Date(createPromocionDto.fecha_fin) <
        new Date(createPromocionDto.fecha_inicio)
    ) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Validar código único si requiere código
    if (
      createPromocionDto.requiere_codigo &&
      createPromocionDto.codigo_promocion
    ) {
      const codigoExists = await this.prisma.promociones.findUnique({
        where: { codigo_promocion: createPromocionDto.codigo_promocion },
      });

      if (codigoExists) {
        throw new ConflictException(
          `Ya existe una promoción con el código: ${createPromocionDto.codigo_promocion}`,
        );
      }
    }

    // Validar que si requiere código, se proporcione
    if (
      createPromocionDto.requiere_codigo &&
      !createPromocionDto.codigo_promocion
    ) {
      throw new BadRequestException(
        'Debe proporcionar un código si requiere_codigo es true',
      );
    }

    // Filtrar valores null y undefined del array
    const productosValidos = (createPromocionDto.productos_promocion || [])
      .filter((p) => p !== null && p !== undefined)
      .filter((p) => p.id_producto || p.id_categoria);

    // Validar productos/categorías según aplicación
    if (
      createPromocionDto.aplicacion !== 'total_cuenta' &&
      productosValidos.length === 0
    ) {
      throw new BadRequestException(
        `Debe especificar al menos un ${createPromocionDto.aplicacion === 'producto' ? 'producto' : 'categoría'} para la promoción`,
      );
    }

    const { productos_promocion, ...promocionData } = createPromocionDto;

    // Convertir fechas string a Date
    const dataToCreate = {
      ...promocionData,
      fecha_inicio: new Date(promocionData.fecha_inicio),
      fecha_fin: promocionData.fecha_fin
        ? new Date(promocionData.fecha_fin)
        : undefined,
    };

    try {
      // Crear promoción y sus relaciones en una transacción
      return await this.prisma.$transaction(async (tx) => {
        // Crear la promoción
        const promocion = await tx.promociones.create({
          data: dataToCreate,
        });

        // Crear las relaciones con productos/categorías si existen
        if (productosValidos.length > 0) {
          await tx.producto_promocion.createMany({
            data: productosValidos.map((pp) => ({
              id_promocion: promocion.id_promocion,
              id_producto: pp.id_producto,
              id_categoria: pp.id_categoria,
              precio_especial: pp.precio_especial,
              cantidad_requerida: pp.cantidad_requerida || 1,
              cantidad_bonificada: pp.cantidad_bonificada || 0,
            })),
          });
        }

        // Retornar promoción con sus relaciones
        return await tx.promociones.findUnique({
          where: { id_promocion: promocion.id_promocion },
          include: {
            producto_promocion: {
              include: {
                productos: true,
                categorias: true,
              },
            },
          },
        });
      });
    } catch (error) {
      throw new BadRequestException('Error al crear la promoción');
    }
  }

  async findAll(filters: FilterPromocionDto) {
    const {
      search,
      tipo,
      aplicacion,
      activa,
      fecha_vigente,
      codigo_promocion,
      combinable,
      id_producto,
      id_categoria,
      page = 1,
      limit = 10,
      sortBy = 'nombre',
      sortOrder = 'asc',
    } = filters;

    const where: Prisma.promocionesWhereInput = {
      AND: [
        activa !== undefined ? { activa } : {},
        tipo ? { tipo } : {},
        aplicacion ? { aplicacion } : {},
        codigo_promocion
          ? {
              codigo_promocion: {
                contains: codigo_promocion,
                mode: 'insensitive',
              },
            }
          : {},
        combinable !== undefined ? { combinable } : {},
        fecha_vigente
          ? {
              AND: [
                { fecha_inicio: { lte: new Date(fecha_vigente) } },
                {
                  OR: [
                    { fecha_fin: null },
                    { fecha_fin: { gte: new Date(fecha_vigente) } },
                  ],
                },
              ],
            }
          : {},
        search
          ? {
              OR: [
                { nombre: { contains: search, mode: 'insensitive' } },
                { descripcion: { contains: search, mode: 'insensitive' } },
                {
                  codigo_promocion: { contains: search, mode: 'insensitive' },
                },
              ],
            }
          : {},
        id_producto || id_categoria
          ? {
              producto_promocion: {
                some: {
                  ...(id_producto ? { id_producto } : {}),
                  ...(id_categoria ? { id_categoria } : {}),
                },
              },
            }
          : {},
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.promociones.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          producto_promocion: {
            include: {
              productos: {
                select: {
                  id_producto: true,
                  nombre: true,
                  sku: true,
                },
              },
              categorias: {
                select: {
                  id_categoria: true,
                  nombre: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.promociones.count({ where }),
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
    const promocion = await this.prisma.promociones.findUnique({
      where: { id_promocion: id },
      include: {
        producto_promocion: {
          include: {
            productos: true,
            categorias: true,
          },
        },
      },
    });

    if (!promocion) {
      throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    }

    return promocion;
  }

  async findByCodigo(codigo: string) {
    const promocion = await this.prisma.promociones.findUnique({
      where: { codigo_promocion: codigo },
      include: {
        producto_promocion: {
          include: {
            productos: true,
            categorias: true,
          },
        },
      },
    });

    if (!promocion) {
      throw new NotFoundException(
        `Promoción con código ${codigo} no encontrada`,
      );
    }

    return promocion;
  }

  async update(id: number, updatePromocionDto: UpdatePromocionDto) {
    await this.findOne(id);

    // Validar fecha_fin si se proporciona
    if (
      updatePromocionDto.fecha_fin &&
      updatePromocionDto.fecha_inicio &&
      new Date(updatePromocionDto.fecha_fin) <
        new Date(updatePromocionDto.fecha_inicio)
    ) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Validar código único si se actualiza
    if (updatePromocionDto.codigo_promocion) {
      const codigoExists = await this.prisma.promociones.findFirst({
        where: {
          codigo_promocion: updatePromocionDto.codigo_promocion,
          NOT: { id_promocion: id },
        },
      });

      if (codigoExists) {
        throw new ConflictException(
          `Ya existe otra promoción con el código: ${updatePromocionDto.codigo_promocion}`,
        );
      }
    }

    const { productos_promocion, ...promocionData } = updatePromocionDto;

    // Convertir fechas string a Date si están presentes
    const dataToUpdate: any = { ...promocionData };
    if (dataToUpdate.fecha_inicio) {
      dataToUpdate.fecha_inicio = new Date(dataToUpdate.fecha_inicio);
    }
    if (dataToUpdate.fecha_fin) {
      dataToUpdate.fecha_fin = new Date(dataToUpdate.fecha_fin);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Actualizar la promoción
        const promocion = await tx.promociones.update({
          where: { id_promocion: id },
          data: dataToUpdate,
        });

        // Si se proporcionan productos/categorías, actualizar las relaciones
        if (productos_promocion) {
          // Eliminar relaciones existentes
          await tx.producto_promocion.deleteMany({
            where: { id_promocion: id },
          });

          // Crear nuevas relaciones
          if (productos_promocion.length > 0) {
            await tx.producto_promocion.createMany({
              data: productos_promocion.map((pp) => ({
                id_promocion: id,
                id_producto: pp.id_producto,
                id_categoria: pp.id_categoria,
                precio_especial: pp.precio_especial,
                cantidad_requerida: pp.cantidad_requerida,
                cantidad_bonificada: pp.cantidad_bonificada,
              })),
            });
          }
        }

        return await tx.promociones.findUnique({
          where: { id_promocion: id },
          include: {
            producto_promocion: {
              include: {
                productos: true,
                categorias: true,
              },
            },
          },
        });
      });
    } catch (error) {
      throw new BadRequestException('Error al actualizar la promoción');
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    // Verificar si la promoción está siendo usada en órdenes
    const ordenesCount = await this.prisma.ordenes.count({
      where: { id_promocion_aplicada: id },
    });

    if (ordenesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la promoción porque está siendo usada en ${ordenesCount} orden(es). Considere desactivarla en su lugar.`,
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Eliminar relaciones con productos/categorías
        await tx.producto_promocion.deleteMany({
          where: { id_promocion: id },
        });

        // Eliminar la promoción
        return await tx.promociones.delete({
          where: { id_promocion: id },
        });
      });
    } catch (error) {
      throw new BadRequestException('Error al eliminar la promoción');
    }
  }

  async toggleActive(id: number) {
    const promocion = await this.findOne(id);

    return await this.prisma.promociones.update({
      where: { id_promocion: id },
      data: { activa: !promocion.activa },
    });
  }

  async incrementarUsos(id: number) {
    const promocion = await this.findOne(id);

    // Validar que no se haya alcanzado el máximo de usos
    if (
      promocion.maximo_usos_total &&
      promocion.usos_actuales &&
      promocion.usos_actuales >= promocion.maximo_usos_total
    ) {
      throw new BadRequestException(
        'La promoción ha alcanzado su máximo de usos',
      );
    }

    return await this.prisma.promociones.update({
      where: { id_promocion: id },
      data: {
        usos_actuales: {
          increment: 1,
        },
      },
    });
  }

  async getPromocionesVigentes() {
    const hoy = new Date();
    const horaActual = `${hoy.getHours().toString().padStart(2, '0')}:${hoy.getMinutes().toString().padStart(2, '0')}:00`;
    const diasSemana = ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'];
    const diaActual = diasSemana[hoy.getDay()];

    return await this.prisma.promociones.findMany({
      where: {
        activa: true,
        fecha_inicio: { lte: hoy },
        OR: [{ fecha_fin: null }, { fecha_fin: { gte: hoy } }],
      },
      include: {
        producto_promocion: {
          include: {
            productos: true,
            categorias: true,
          },
        },
      },
    });
  }

  async validarCodigo(codigo: string) {
    const promocion = await this.findByCodigo(codigo);

    // Validar que esté activa
    if (!promocion.activa) {
      throw new BadRequestException('La promoción no está activa');
    }

    // Validar fechas
    const hoy = new Date();
    if (promocion.fecha_inicio > hoy) {
      throw new BadRequestException('La promoción aún no ha iniciado');
    }
    if (promocion.fecha_fin && promocion.fecha_fin < hoy) {
      throw new BadRequestException('La promoción ha expirado');
    }

    // Validar usos máximos
    if (
      promocion.maximo_usos_total &&
      promocion.usos_actuales &&
      promocion.usos_actuales >= promocion.maximo_usos_total
    ) {
      throw new BadRequestException(
        'La promoción ha alcanzado su máximo de usos',
      );
    }

    return {
      valido: true,
      promocion,
    };
  }

  async getEstadisticas(id: number) {
    const promocion = await this.findOne(id);

    const ordenesConPromocion = await this.prisma.ordenes.count({
      where: { id_promocion_aplicada: id },
    });

    const descuentoTotal = await this.prisma.ordenes.aggregate({
      where: { id_promocion_aplicada: id },
      _sum: {
        descuento_monto: true,
      },
    });

    return {
      id_promocion: id,
      nombre: promocion.nombre,
      usos_actuales: promocion.usos_actuales || 0,
      maximo_usos_total: promocion.maximo_usos_total,
      ordenes_aplicadas: ordenesConPromocion,
      descuento_total_otorgado: descuentoTotal._sum.descuento_monto || 0,
      productos_asociados: promocion.producto_promocion.filter(
        (pp) => pp.id_producto,
      ).length,
      categorias_asociadas: promocion.producto_promocion.filter(
        (pp) => pp.id_categoria,
      ).length,
    };
  }
}
