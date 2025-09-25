import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { QueryProductosDto } from './dto/query-productos.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto) {
    // Verificar SKU único
    const existingProduct = await this.prisma.productos.findUnique({
      where: { sku: createProductoDto.codigo }, // Mapear codigo a sku
    });

    if (existingProduct) {
      throw new ConflictException(
        `El código ${createProductoDto.codigo} ya está en uso`,
      );
    }

    // Verificar que la categoría existe
    const categoria = await this.prisma.categorias.findUnique({
      where: { id_categoria: createProductoDto.id_tipo_producto }, // Usar id_categoria
    });

    if (!categoria) {
      throw new BadRequestException('La categoría no existe');
    }

    // Verificar que la unidad de medida existe
    const unidadMedida = await this.prisma.unidades_medida.findUnique({
      where: { id_unidad: createProductoDto.id_unidad_medida },
    });

    if (!unidadMedida) {
      throw new BadRequestException('La unidad de medida no existe');
    }

    // Validar stock mínimo y máximo
    if (
      createProductoDto.stock_minimo &&
      createProductoDto.stock_maximo &&
      createProductoDto.stock_minimo >= createProductoDto.stock_maximo
    ) {
      throw new BadRequestException(
        'El stock mínimo debe ser menor al stock máximo',
      );
    }

    // Crear el producto
    const producto = await this.prisma.productos.create({
      data: {
        sku: createProductoDto.codigo, // Mapear codigo a sku
        nombre: createProductoDto.nombre,
        descripcion: createProductoDto.descripcion,
        id_categoria: createProductoDto.id_tipo_producto, // Mapear id_tipo_producto a id_categoria
        id_unidad_medida: createProductoDto.id_unidad_medida,
        precio_venta: new Prisma.Decimal(createProductoDto.precio_venta),
        costo_promedio: createProductoDto.costo
          ? new Prisma.Decimal(createProductoDto.costo)
          : null,
        iva_tasa: createProductoDto.iva
          ? new Prisma.Decimal(createProductoDto.iva)
          : new Prisma.Decimal(16),
        disponible: createProductoDto.disponible_venta ?? true,
        es_vendible: createProductoDto.disponible_venta ?? true,
        tiempo_preparacion_min: createProductoDto.tiempo_preparacion_min,
        calorias: createProductoDto.calorias,
        imagen_url: createProductoDto.imagen_url,
        alergenos: createProductoDto.alergenos?.join(','),
      },
      include: {
        categorias: true,
        unidades_medida: true,
      },
    });

    // Si necesitas crear el inventario inicial
    if (createProductoDto.stock_minimo || createProductoDto.stock_maximo) {
      await this.prisma.inventario.create({
        data: {
          id_producto: producto.id_producto,
          stock_actual: new Prisma.Decimal(0),
          stock_minimo: createProductoDto.stock_minimo
            ? new Prisma.Decimal(createProductoDto.stock_minimo)
            : new Prisma.Decimal(0),
          stock_maximo: createProductoDto.stock_maximo
            ? new Prisma.Decimal(createProductoDto.stock_maximo)
            : null,
          ubicacion_almacen: createProductoDto.ubicacion_almacen,
        },
      });
    }

    return producto;
  }

  async findAll(query: QueryProductosDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoria,
      activo,
      disponible,
      ordenarPor = 'nombre',
      orden = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.productosWhereInput = {
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }, // Usar sku en vez de codigo
          { descripcion: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoria && { id_categoria: categoria }), // Usar id_categoria
      ...(disponible !== undefined && { disponible }), // Usar disponible
      ...(activo !== undefined && {
        deleted_at: activo ? null : { not: null },
      }), // Usar deleted_at para soft delete
    };

    // Mapear ordenarPor al campo correcto de la DB
    const campoOrdenamiento: Record<string, string> = {
      nombre: 'nombre',
      precio: 'precio_venta',
      codigo: 'sku',
      stock: 'nombre', // No hay stock_actual directo en productos, usar nombre
      createdAt: 'created_at',
    };

    const orderBy: Prisma.productosOrderByWithRelationInput = {
      [campoOrdenamiento[ordenarPor] || 'nombre']: orden,
    };

    const [productos, total] = await Promise.all([
      this.prisma.productos.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          categorias: true,
          unidades_medida: true,
          inventario: true, // Incluir inventario para obtener stock
        },
      }),
      this.prisma.productos.count({ where }),
    ]);

    return {
      data: productos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findActivos(query: QueryProductosDto) {
    return this.findAll({
      ...query,
      activo: true,
      disponible: true,
    });
  }

  async search(searchTerm: string) {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    return this.prisma.productos.findMany({
      where: {
        AND: [
          { disponible: true },
          { es_vendible: true },
          { deleted_at: null },
          {
            OR: [
              { nombre: { contains: searchTerm, mode: 'insensitive' } },
              { sku: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        ],
      },
      take: 10,
      include: {
        categorias: true,
        unidades_medida: true,
      },
    });
  }

  async findByCategoria(categoriaId: number, query: QueryProductosDto) {
    return this.findAll({
      ...query,
      categoria: categoriaId,
    });
  }

  async findOne(id: number) {
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: id },
      include: {
        categorias: true,
        unidades_medida: true,
        inventario: true,
      },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    // Verificar que el producto existe
    await this.findOne(id);

    // Si se está actualizando el código (sku), verificar que sea único
    if (updateProductoDto.codigo) {
      const existingProduct = await this.prisma.productos.findFirst({
        where: {
          sku: updateProductoDto.codigo,
          NOT: { id_producto: id },
        },
      });

      if (existingProduct) {
        throw new ConflictException(
          `El código ${updateProductoDto.codigo} ya está en uso`,
        );
      }
    }

    // Verificar categoría si se está actualizando
    if (updateProductoDto.id_tipo_producto) {
      const categoria = await this.prisma.categorias.findUnique({
        where: { id_categoria: updateProductoDto.id_tipo_producto },
      });

      if (!categoria) {
        throw new BadRequestException('La categoría no existe');
      }
    }

    // Verificar unidad de medida si se está actualizando
    if (updateProductoDto.id_unidad_medida) {
      const unidadMedida = await this.prisma.unidades_medida.findUnique({
        where: { id_unidad: updateProductoDto.id_unidad_medida },
      });

      if (!unidadMedida) {
        throw new BadRequestException('La unidad de medida no existe');
      }
    }

    // Preparar datos para actualización
    const updateData: any = {};

    // Mapear campos del DTO a campos de la DB
    if (updateProductoDto.codigo !== undefined)
      updateData.sku = updateProductoDto.codigo;
    if (updateProductoDto.nombre !== undefined)
      updateData.nombre = updateProductoDto.nombre;
    if (updateProductoDto.descripcion !== undefined)
      updateData.descripcion = updateProductoDto.descripcion;
    if (updateProductoDto.id_tipo_producto !== undefined)
      updateData.id_categoria = updateProductoDto.id_tipo_producto;
    if (updateProductoDto.id_unidad_medida !== undefined)
      updateData.id_unidad_medida = updateProductoDto.id_unidad_medida;
    if (updateProductoDto.precio_venta !== undefined)
      updateData.precio_venta = new Prisma.Decimal(
        updateProductoDto.precio_venta,
      );
    if (updateProductoDto.costo !== undefined)
      updateData.costo_promedio = new Prisma.Decimal(updateProductoDto.costo);
    if (updateProductoDto.iva !== undefined)
      updateData.iva_tasa = new Prisma.Decimal(updateProductoDto.iva);
    if (updateProductoDto.disponible_venta !== undefined) {
      updateData.disponible = updateProductoDto.disponible_venta;
      updateData.es_vendible = updateProductoDto.disponible_venta;
    }
    if (updateProductoDto.tiempo_preparacion_min !== undefined)
      updateData.tiempo_preparacion_min =
        updateProductoDto.tiempo_preparacion_min;
    if (updateProductoDto.calorias !== undefined)
      updateData.calorias = updateProductoDto.calorias;
    if (updateProductoDto.imagen_url !== undefined)
      updateData.imagen_url = updateProductoDto.imagen_url;
    if (updateProductoDto.alergenos !== undefined)
      updateData.alergenos = updateProductoDto.alergenos.join(',');

    const producto = await this.prisma.productos.update({
      where: { id_producto: id },
      data: updateData,
      include: {
        categorias: true,
        unidades_medida: true,
        inventario: true,
      },
    });

    // Actualizar inventario si es necesario
    if (
      updateProductoDto.stock_minimo !== undefined ||
      updateProductoDto.stock_maximo !== undefined
    ) {
      const inventarioExiste = await this.prisma.inventario.findUnique({
        where: { id_producto: id },
      });

      if (inventarioExiste) {
        await this.prisma.inventario.update({
          where: { id_producto: id },
          data: {
            ...(updateProductoDto.stock_minimo !== undefined && {
              stock_minimo: new Prisma.Decimal(updateProductoDto.stock_minimo),
            }),
            ...(updateProductoDto.stock_maximo !== undefined && {
              stock_maximo: new Prisma.Decimal(updateProductoDto.stock_maximo),
            }),
            ...(updateProductoDto.ubicacion_almacen && {
              ubicacion_almacen: updateProductoDto.ubicacion_almacen,
            }),
          },
        });
      } else {
        await this.prisma.inventario.create({
          data: {
            id_producto: id,
            stock_actual: new Prisma.Decimal(0),
            stock_minimo: updateProductoDto.stock_minimo
              ? new Prisma.Decimal(updateProductoDto.stock_minimo)
              : new Prisma.Decimal(0),
            stock_maximo: updateProductoDto.stock_maximo
              ? new Prisma.Decimal(updateProductoDto.stock_maximo)
              : null,
            ubicacion_almacen: updateProductoDto.ubicacion_almacen,
          },
        });
      }
    }

    return producto;
  }

  async remove(id: number) {
    // Verificar que el producto existe
    await this.findOne(id);

    // Verificar si el producto tiene movimientos de inventario o está en órdenes
    const [movimientos, ordenes] = await Promise.all([
      this.prisma.movimientos_inventario.count({
        where: { id_producto: id },
      }),
      this.prisma.orden_detalle.count({
        where: { id_producto: id },
      }),
    ]);

    if (movimientos > 0 || ordenes > 0) {
      // Si tiene historial, solo hacer soft delete
      return this.prisma.productos.update({
        where: { id_producto: id },
        data: {
          deleted_at: new Date(),
          disponible: false,
          es_vendible: false,
        },
      });
    }

    // Si no tiene historial, se puede eliminar físicamente
    return this.prisma.productos.delete({
      where: { id_producto: id },
    });
  }

  async activar(id: number) {
    await this.findOne(id);

    return this.prisma.productos.update({
      where: { id_producto: id },
      data: {
        deleted_at: null,
        disponible: true,
        es_vendible: true,
      },
      include: {
        categorias: true,
        unidades_medida: true,
        inventario: true,
      },
    });
  }

  async desactivar(id: number) {
    await this.findOne(id);

    return this.prisma.productos.update({
      where: { id_producto: id },
      data: {
        disponible: false,
        es_vendible: false,
      },
      include: {
        categorias: true,
        unidades_medida: true,
        inventario: true,
      },
    });
  }

  async getEstadisticas() {
    const [totalProductos, productosActivos, productosBajoStock, categorias] =
      await Promise.all([
        this.prisma.productos.count(),
        this.prisma.productos.count({
          where: {
            deleted_at: null,
            disponible: true,
          },
        }),
        // Contar productos con stock bajo
        this.prisma.inventario.count({
          where: {
            stock_actual: {
              lte: this.prisma.inventario.fields.stock_minimo as any,
            },
          },
        }),
        this.prisma.categorias.findMany({
          where: { activa: true },
          select: {
            id_categoria: true,
            nombre: true,
            _count: {
              select: { productos: true },
            },
          },
        }),
      ]);

    return {
      totalProductos,
      productosActivos,
      productosInactivos: totalProductos - productosActivos,
      productosBajoStock,
      productosPorCategoria: categorias.map((cat) => ({
        id: cat.id_categoria,
        nombre: cat.nombre,
        cantidad: cat._count.productos,
      })),
    };
  }
}
