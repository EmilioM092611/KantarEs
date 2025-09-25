import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    // Verificar nombre único
    const existing = await this.prisma.categorias.findFirst({
      where: {
        nombre: {
          equals: createCategoriaDto.nombre,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una categoría con el nombre ${createCategoriaDto.nombre}`,
      );
    }

    // Si no se especifica orden, ponerlo al final
    if (createCategoriaDto.orden_menu === undefined) {
      const maxOrden = await this.prisma.categorias.aggregate({
        _max: { orden_visualizacion: true },
      });
      createCategoriaDto.orden_menu =
        (maxOrden._max.orden_visualizacion || 0) + 1;
    }

    // Crear la categoría
    return this.prisma.categorias.create({
      data: {
        nombre: createCategoriaDto.nombre,
        descripcion: createCategoriaDto.descripcion,
        orden_visualizacion: createCategoriaDto.orden_menu,
        visible_menu: true,
        activa: createCategoriaDto.activo ?? true,
        // Si necesitas asociar con tipo_producto
        id_tipo_producto: createCategoriaDto.requiere_preparacion ? 1 : null,
      },
    });
  }

  async findAll(activo?: boolean) {
    return this.prisma.categorias.findMany({
      where: activo !== undefined ? { activa: activo } : undefined,
      orderBy: [{ orden_visualizacion: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findAllWithProductCount() {
    return this.prisma.categorias.findMany({
      orderBy: [{ orden_visualizacion: 'asc' }, { nombre: 'asc' }],
      include: {
        _count: {
          select: { productos: true },
        },
      },
    });
  }

  async getCategoriasMenu() {
    return this.prisma.categorias.findMany({
      where: {
        activa: true,
        visible_menu: true,
        productos: {
          some: {
            disponible: true,
            es_vendible: true,
            deleted_at: null,
          },
        },
      },
      orderBy: [{ orden_visualizacion: 'asc' }, { nombre: 'asc' }],
      include: {
        productos: {
          where: {
            disponible: true,
            es_vendible: true,
            deleted_at: null,
          },
          orderBy: { nombre: 'asc' },
        },
      },
    });
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categorias.findUnique({
      where: { id_categoria: id },
      include: {
        _count: {
          select: { productos: true },
        },
      },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return categoria;
  }

  async getProductosByCategoria(id: number) {
    await this.findOne(id); // Verificar que existe

    return this.prisma.productos.findMany({
      where: {
        id_categoria: id,
        deleted_at: null,
      },
      orderBy: { nombre: 'asc' },
      include: {
        unidades_medida: true,
        inventario: true,
      },
    });
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    await this.findOne(id);

    // Si se actualiza el nombre, verificar que sea único
    if (updateCategoriaDto.nombre) {
      const existing = await this.prisma.categorias.findFirst({
        where: {
          nombre: {
            equals: updateCategoriaDto.nombre,
            mode: 'insensitive',
          },
          NOT: { id_categoria: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe una categoría con el nombre ${updateCategoriaDto.nombre}`,
        );
      }
    }

    // Preparar datos para actualización
    const updateData: any = {};

    if (updateCategoriaDto.nombre !== undefined)
      updateData.nombre = updateCategoriaDto.nombre;
    if (updateCategoriaDto.descripcion !== undefined)
      updateData.descripcion = updateCategoriaDto.descripcion;
    if (updateCategoriaDto.orden_menu !== undefined)
      updateData.orden_visualizacion = updateCategoriaDto.orden_menu;
    if (updateCategoriaDto.activo !== undefined)
      updateData.activa = updateCategoriaDto.activo;
    if (updateCategoriaDto.icono !== undefined)
      updateData.imagen_url = updateCategoriaDto.icono;

    return this.prisma.categorias.update({
      where: { id_categoria: id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);

    // Verificar si hay productos en esta categoría
    const productosCount = await this.prisma.productos.count({
      where: {
        id_categoria: id,
        deleted_at: null,
      },
    });

    if (productosCount > 0) {
      // Si tiene productos, solo desactivarla
      return this.prisma.categorias.update({
        where: { id_categoria: id },
        data: { activa: false },
      });
    }

    // Si no tiene productos, se puede eliminar
    return this.prisma.categorias.delete({
      where: { id_categoria: id },
    });
  }

  async activar(id: number) {
    await this.findOne(id);

    return this.prisma.categorias.update({
      where: { id_categoria: id },
      data: {
        activa: true,
        visible_menu: true,
      },
    });
  }

  async desactivar(id: number) {
    await this.findOne(id);

    // También desactivar la venta de productos de esta categoría
    await this.prisma.productos.updateMany({
      where: { id_categoria: id },
      data: {
        disponible: false,
        es_vendible: false,
      },
    });

    return this.prisma.categorias.update({
      where: { id_categoria: id },
      data: {
        activa: false,
        visible_menu: false,
      },
    });
  }

  async reordenarCategorias(categorias: { id: number; orden: number }[]) {
    const updates = categorias.map((cat) =>
      this.prisma.categorias.update({
        where: { id_categoria: cat.id },
        data: { orden_visualizacion: cat.orden },
      }),
    );

    await this.prisma.$transaction(updates);
  }
}
