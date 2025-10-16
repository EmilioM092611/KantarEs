// backend/src/tipos-producto/tipos-producto.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoProductoDto } from './dto/create-tipo-producto.dto';
import { UpdateTipoProductoDto } from './dto/update-tipo-producto.dto';
import { QueryTiposProductoDto } from './dto/query-tipos-producto.dto';

@Injectable()
export class TiposProductoService {
  constructor(private readonly prisma: PrismaService) {}

  // === MEJORA 7: CRUD completo y funcional ===

  async findAll(query: QueryTiposProductoDto) {
    const { activo, area_preparacion } = query;
    const where: any = {};

    if (activo !== undefined) {
      // Manejo correcto para string o boolean
      if (typeof activo === 'string') {
        where.activo = activo === 'true';
      } else {
        where.activo = activo;
      }
    }

    if (area_preparacion) {
      where.area_preparacion = area_preparacion;
    }

    return this.prisma.tipos_producto.findMany({
      where,
      orderBy: { orden_menu: 'asc' },
      include: {
        _count: {
          select: {
            categorias: true,
          },
        },
      },
    });
  }

  async findActivos() {
    return this.prisma.tipos_producto.findMany({
      where: { activo: true },
      orderBy: { orden_menu: 'asc' },
    });
  }

  async findOne(id: number) {
    const tipo = await this.prisma.tipos_producto.findUnique({
      where: { id_tipo_producto: id },
      include: {
        _count: {
          select: {
            categorias: true,
          },
        },
      },
    });

    if (!tipo) {
      throw new NotFoundException(
        `Tipo de producto con ID ${id} no encontrado`,
      );
    }

    return tipo;
  }

  async getCategorias(id: number) {
    await this.findOne(id); // Validar que existe

    return this.prisma.categorias.findMany({
      where: {
        id_tipo_producto: id,
        activa: true,
      },
      orderBy: {
        orden_visualizacion: 'asc',
      },
    });
  }

  async create(createTipoDto: CreateTipoProductoDto) {
    // Validar unicidad del nombre (case-insensitive)
    const existente = await this.prisma.tipos_producto.findFirst({
      where: {
        nombre: {
          equals: createTipoDto.nombre,
          mode: 'insensitive',
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un tipo con el nombre "${createTipoDto.nombre}"`,
      );
    }

    // Si no se proporciona orden_menu, calcular el siguiente
    if (!createTipoDto.orden_menu) {
      const maxOrden = await this.prisma.tipos_producto.aggregate({
        _max: {
          orden_menu: true,
        },
      });
      createTipoDto.orden_menu = (maxOrden._max.orden_menu || 0) + 1;
    }

    return this.prisma.tipos_producto.create({
      data: createTipoDto,
    });
  }

  async update(id: number, updateTipoDto: UpdateTipoProductoDto) {
    await this.findOne(id);

    // Si se actualiza el nombre, validar unicidad
    if (updateTipoDto.nombre) {
      const existente = await this.prisma.tipos_producto.findFirst({
        where: {
          nombre: {
            equals: updateTipoDto.nombre,
            mode: 'insensitive',
          },
          id_tipo_producto: {
            not: id,
          },
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe otro tipo con el nombre "${updateTipoDto.nombre}"`,
        );
      }
    }

    return this.prisma.tipos_producto.update({
      where: { id_tipo_producto: id },
      data: updateTipoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Verificar si tiene categorías asociadas
    const categoriasCount = await this.prisma.categorias.count({
      where: {
        id_tipo_producto: id,
        activa: true,
      },
    });

    if (categoriasCount > 0) {
      throw new ConflictException(
        `No se puede desactivar el tipo porque tiene ${categoriasCount} categorías activas asociadas`,
      );
    }

    // Soft delete
    await this.prisma.tipos_producto.update({
      where: { id_tipo_producto: id },
      data: { activo: false },
    });
  }

  async activar(id: number) {
    const tipo = await this.prisma.tipos_producto.findUnique({
      where: { id_tipo_producto: id },
    });

    if (!tipo) {
      throw new NotFoundException(
        `Tipo de producto con ID ${id} no encontrado`,
      );
    }

    return this.prisma.tipos_producto.update({
      where: { id_tipo_producto: id },
      data: { activo: true },
    });
  }
}
