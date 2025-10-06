/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { FilterProveedorDto } from './dto/filter-proveedor.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProveedorDto: CreateProveedorDto) {
    // Verificar si el RFC ya existe
    const rfcExists = await this.prisma.proveedores.findUnique({
      where: { rfc: createProveedorDto.rfc },
    });

    if (rfcExists) {
      throw new ConflictException(
        `Ya existe un proveedor con el RFC: ${createProveedorDto.rfc}`,
      );
    }

    try {
      return await this.prisma.proveedores.create({
        data: createProveedorDto,
      });
    } catch (error) {
      throw new BadRequestException('Error al crear el proveedor');
    }
  }

  async findAll(filters: FilterProveedorDto) {
    const {
      search,
      activo,
      ciudad,
      estado,
      calificacion_min,
      page = 1,
      limit = 10,
      sortBy = 'razon_social',
      sortOrder = 'asc',
    } = filters;

    // Construir el where dinámicamente
    const where: Prisma.proveedoresWhereInput = {
      AND: [
        activo !== undefined ? { activo } : {},
        ciudad ? { ciudad: { contains: ciudad, mode: 'insensitive' } } : {},
        estado ? { estado: { contains: estado, mode: 'insensitive' } } : {},
        calificacion_min ? { calificacion: { gte: calificacion_min } } : {},
        search
          ? {
              OR: [
                { razon_social: { contains: search, mode: 'insensitive' } },
                { nombre_comercial: { contains: search, mode: 'insensitive' } },
                { rfc: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.proveedores.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.proveedores.count({ where }),
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
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id_proveedor: id },
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    return proveedor;
  }

  async findByRfc(rfc: string) {
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { rfc },
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con RFC ${rfc} no encontrado`);
    }

    return proveedor;
  }

  async update(id: number, updateProveedorDto: UpdateProveedorDto) {
    // Verificar que el proveedor existe
    await this.findOne(id);

    // Si se está actualizando el RFC, verificar que no exista otro con ese RFC
    if (updateProveedorDto.rfc) {
      const rfcExists = await this.prisma.proveedores.findFirst({
        where: {
          rfc: updateProveedorDto.rfc,
          NOT: { id_proveedor: id },
        },
      });

      if (rfcExists) {
        throw new ConflictException(
          `Ya existe otro proveedor con el RFC: ${updateProveedorDto.rfc}`,
        );
      }
    }

    try {
      return await this.prisma.proveedores.update({
        where: { id_proveedor: id },
        data: updateProveedorDto,
      });
    } catch (error) {
      throw new BadRequestException('Error al actualizar el proveedor');
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    // Verificar si tiene compras asociadas
    const comprasCount = await this.prisma.compras.count({
      where: { id_proveedor: id },
    });

    if (comprasCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el proveedor porque tiene ${comprasCount} compra(s) asociada(s). Considere desactivarlo en su lugar.`,
      );
    }

    try {
      return await this.prisma.proveedores.delete({
        where: { id_proveedor: id },
      });
    } catch (error) {
      throw new BadRequestException('Error al eliminar el proveedor');
    }
  }

  async toggleActive(id: number) {
    const proveedor = await this.findOne(id);

    return await this.prisma.proveedores.update({
      where: { id_proveedor: id },
      data: { activo: !proveedor.activo },
    });
  }

  async getHistorialCompras(id: number) {
    await this.findOne(id);

    const compras = await this.prisma.compras.findMany({
      where: { id_proveedor: id },
      include: {
        usuarios_compras_id_usuario_solicitaTousuarios: {
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
      orderBy: { fecha_pedido: 'desc' },
    });

    const totalCompras = compras.length;
    const totalGastado = compras.reduce(
      (sum, compra) => sum + Number(compra.total || 0),
      0,
    );

    const ultimaCompra = compras[0] || null;

    return {
      proveedor_id: id,
      total_compras: totalCompras,
      total_gastado: totalGastado,
      ultima_compra: ultimaCompra?.fecha_pedido || null,
      compras,
    };
  }

  async getEstadisticas(id: number) {
    await this.findOne(id);

    const compras = await this.prisma.compras.findMany({
      where: { id_proveedor: id },
      select: {
        total: true,
        estado: true,
        fecha_pedido: true,
      },
    });

    const estadisticas = {
      total_compras: compras.length,
      compras_por_estado: {
        pendiente: compras.filter((c) => c.estado === 'pendiente').length,
        autorizada: compras.filter((c) => c.estado === 'autorizada').length,
        recibida: compras.filter((c) => c.estado === 'recibida').length,
        cancelada: compras.filter((c) => c.estado === 'cancelada').length,
      },
      monto_total: compras.reduce((sum, c) => sum + Number(c.total || 0), 0),
      promedio_compra:
        compras.length > 0
          ? compras.reduce((sum, c) => sum + Number(c.total || 0), 0) /
            compras.length
          : 0,
    };

    return estadisticas;
  }

  async getProveedoresActivos() {
    return await this.prisma.proveedores.findMany({
      where: { activo: true },
      orderBy: { razon_social: 'asc' },
      select: {
        id_proveedor: true,
        razon_social: true,
        nombre_comercial: true,
        rfc: true,
        telefono: true,
        email: true,
      },
    });
  }
}
