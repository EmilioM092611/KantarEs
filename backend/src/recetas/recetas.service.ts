/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearRecetaDto } from './dto/crear-receta.dto';
import { ActualizarRecetaDto } from './dto/actualizar-receta.dto';
import { AgregarInsumoDto } from './dto/agregar-insumo.dto';
import { QueryRecetasDto } from './dto/query-recetas.dto';
import { Prisma } from '@prisma/client';

export interface RecetaAgrupada {
  id_producto_final: number;
  producto: any;
  insumos: any[];
  costo_total?: number;
}
@Injectable()
export class RecetasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva receta completa con todos sus insumos
   */
  async crear(crearRecetaDto: CrearRecetaDto) {
    // Validar que el producto final existe y es inventariable
    const productoFinal = await this.prisma.productos.findUnique({
      where: { id_producto: crearRecetaDto.id_producto_final },
    });

    if (!productoFinal) {
      throw new NotFoundException(
        `Producto final con ID ${crearRecetaDto.id_producto_final} no encontrado`,
      );
    }

    if (!productoFinal.es_inventariable) {
      throw new BadRequestException(
        'El producto final debe ser inventariable para tener una receta',
      );
    }

    // Validar que no exista ya una receta para este producto
    const recetaExistente = await this.prisma.receta_insumos.findFirst({
      where: { id_producto_final: crearRecetaDto.id_producto_final },
    });

    if (recetaExistente) {
      throw new ConflictException(
        `Ya existe una receta para el producto ${productoFinal.nombre}`,
      );
    }

    // Validar todos los insumos
    await this.validarInsumos(crearRecetaDto.insumos);

    // Crear receta en transacción
    return this.prisma.$transaction(async (tx) => {
      // Crear todos los insumos de la receta
      const insumosCreados = await Promise.all(
        crearRecetaDto.insumos.map((insumo) =>
          tx.receta_insumos.create({
            data: {
              id_producto_final: crearRecetaDto.id_producto_final,
              id_insumo: insumo.id_insumo,
              cantidad_necesaria: new Prisma.Decimal(insumo.cantidad_necesaria),
              id_unidad_medida: insumo.id_unidad_medida,
              merma_esperada_porcentaje: insumo.merma_esperada_porcentaje
                ? new Prisma.Decimal(insumo.merma_esperada_porcentaje)
                : new Prisma.Decimal(0),
              notas_preparacion: insumo.notas_preparacion,
            },
            include: {
              productos_receta_insumos_id_insumoToproductos: {
                select: {
                  id_producto: true,
                  nombre: true,
                  costo_promedio: true,
                },
              },
              unidades_medida: {
                select: {
                  nombre: true,
                  abreviatura: true,
                },
              },
            },
          }),
        ),
      );

      // Actualizar notas de receta en el producto (opcional)
      if (crearRecetaDto.notas_receta) {
        await tx.productos.update({
          where: { id_producto: crearRecetaDto.id_producto_final },
          data: { receta: crearRecetaDto.notas_receta },
        });
      }

      // Calcular y actualizar costo promedio del producto
      await this.calcularYActualizarCosto(tx, crearRecetaDto.id_producto_final);

      return {
        producto_final: productoFinal,
        insumos: insumosCreados,
        costo_total: await this.calcularCostoReceta(
          crearRecetaDto.id_producto_final,
        ),
      };
    });
  }

  /**
   * Obtener todas las recetas con filtros opcionales
   */
  async findAll(query: QueryRecetasDto): Promise<RecetaAgrupada[]> {
    const where: any = {};

    if (query.id_producto_final) {
      where.id_producto_final = query.id_producto_final;
    }

    if (query.id_insumo) {
      where.id_insumo = query.id_insumo;
    }

    const recetas = await this.prisma.receta_insumos.findMany({
      where,
      include: {
        productos_receta_insumos_id_producto_finalToproductos: {
          select: {
            id_producto: true,
            nombre: true,
            costo_promedio: true,
            precio_venta: true,
          },
        },
        productos_receta_insumos_id_insumoToproductos: {
          select: {
            id_producto: true,
            nombre: true,
            costo_promedio: true,
          },
        },
        unidades_medida: {
          select: {
            nombre: true,
            abreviatura: true,
          },
        },
      },
      orderBy: [{ id_producto_final: 'asc' }, { id: 'asc' }],
    });

    const recetasAgrupadas = this.agruparPorProducto(recetas);

    if (query.con_costo) {
      for (const receta of recetasAgrupadas) {
        receta.costo_total = await this.calcularCostoReceta(
          receta.id_producto_final,
        );
      }
    }

    return recetasAgrupadas;
  }

  /**
   * Obtener receta de un producto específico
   */
  async findOne(idProductoFinal: number) {
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: idProductoFinal },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${idProductoFinal} no encontrado`,
      );
    }

    const receta = await this.prisma.receta_insumos.findMany({
      where: { id_producto_final: idProductoFinal },
      include: {
        productos_receta_insumos_id_insumoToproductos: {
          select: {
            id_producto: true,
            sku: true,
            nombre: true,
            costo_promedio: true,
            es_insumo: true,
          },
        },
        unidades_medida: true,
      },
      orderBy: { id: 'asc' },
    });

    if (receta.length === 0) {
      throw new NotFoundException(
        `No existe receta para el producto ${producto.nombre}`,
      );
    }

    const costoTotal = await this.calcularCostoReceta(idProductoFinal);
    const margenUtilidad = producto.precio_venta
      ? ((Number(producto.precio_venta) - Number(costoTotal)) /
          Number(producto.precio_venta)) *
        100
      : 0;

    return {
      producto: {
        id_producto: producto.id_producto,
        sku: producto.sku,
        nombre: producto.nombre,
        precio_venta: producto.precio_venta,
        costo_promedio: producto.costo_promedio,
        receta_notas: producto.receta,
      },
      insumos: receta,
      analisis_costos: {
        costo_total_insumos: costoTotal,
        precio_venta: producto.precio_venta,
        margen_utilidad_porcentaje: margenUtilidad.toFixed(2),
        ganancia_unitaria: producto.precio_venta
          ? Number(producto.precio_venta) - Number(costoTotal)
          : 0,
      },
    };
  }

  /**
   * Agregar un insumo a una receta existente
   */
  async agregarInsumo(
    idProductoFinal: number,
    agregarInsumoDto: AgregarInsumoDto,
  ) {
    // Verificar que la receta existe
    await this.findOne(idProductoFinal);

    // Validar el insumo
    await this.validarInsumo(agregarInsumoDto.id_insumo);

    // Verificar que el insumo no esté ya en la receta
    const insumoExistente = await this.prisma.receta_insumos.findFirst({
      where: {
        id_producto_final: idProductoFinal,
        id_insumo: agregarInsumoDto.id_insumo,
      },
    });

    if (insumoExistente) {
      throw new ConflictException(
        'Este insumo ya existe en la receta. Use la actualización para modificarlo.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const nuevoInsumo = await tx.receta_insumos.create({
        data: {
          id_producto_final: idProductoFinal,
          id_insumo: agregarInsumoDto.id_insumo,
          cantidad_necesaria: new Prisma.Decimal(
            agregarInsumoDto.cantidad_necesaria,
          ),
          id_unidad_medida: agregarInsumoDto.id_unidad_medida,
          merma_esperada_porcentaje: agregarInsumoDto.merma_esperada_porcentaje
            ? new Prisma.Decimal(agregarInsumoDto.merma_esperada_porcentaje)
            : new Prisma.Decimal(0),
          notas_preparacion: agregarInsumoDto.notas_preparacion,
        },
        include: {
          productos_receta_insumos_id_insumoToproductos: true,
          unidades_medida: true,
        },
      });

      // Recalcular costo del producto
      await this.calcularYActualizarCosto(tx, idProductoFinal);

      return nuevoInsumo;
    });
  }

  /**
   * Actualizar un insumo en la receta
   */
  async actualizarInsumo(
    idReceta: number,
    actualizarDto: Partial<AgregarInsumoDto>,
  ) {
    const insumo = await this.prisma.receta_insumos.findUnique({
      where: { id: idReceta },
    });

    if (!insumo) {
      throw new NotFoundException(
        `Insumo de receta con ID ${idReceta} no encontrado`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const insumoActualizado = await tx.receta_insumos.update({
        where: { id: idReceta },
        data: {
          ...(actualizarDto.cantidad_necesaria && {
            cantidad_necesaria: new Prisma.Decimal(
              actualizarDto.cantidad_necesaria,
            ),
          }),
          ...(actualizarDto.id_unidad_medida && {
            id_unidad_medida: actualizarDto.id_unidad_medida,
          }),
          ...(actualizarDto.merma_esperada_porcentaje !== undefined && {
            merma_esperada_porcentaje: new Prisma.Decimal(
              actualizarDto.merma_esperada_porcentaje,
            ),
          }),
          ...(actualizarDto.notas_preparacion !== undefined && {
            notas_preparacion: actualizarDto.notas_preparacion,
          }),
        },
        include: {
          productos_receta_insumos_id_insumoToproductos: true,
          unidades_medida: true,
        },
      });

      // Recalcular costo del producto
      await this.calcularYActualizarCosto(tx, insumo.id_producto_final);

      return insumoActualizado;
    });
  }

  /**
   * Eliminar un insumo de la receta (SoftDelete a nivel de producto)
   */
  async eliminarInsumo(idReceta: number) {
    const insumo = await this.prisma.receta_insumos.findUnique({
      where: { id: idReceta },
      include: {
        productos_receta_insumos_id_insumoToproductos: true,
      },
    });

    if (!insumo) {
      throw new NotFoundException(
        `Insumo de receta con ID ${idReceta} no encontrado`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Eliminar el insumo de la receta
      await tx.receta_insumos.delete({
        where: { id: idReceta },
      });

      // Recalcular costo del producto
      await this.calcularYActualizarCosto(tx, insumo.id_producto_final);

      return {
        mensaje: `Insumo ${insumo.productos_receta_insumos_id_insumoToproductos.nombre} eliminado de la receta`,
        id_producto_final: insumo.id_producto_final,
      };
    });
  }

  /**
   * Eliminar toda la receta de un producto
   */
  async eliminarReceta(idProductoFinal: number) {
    // Verificar que existe la receta
    await this.findOne(idProductoFinal);

    return this.prisma.$transaction(async (tx) => {
      // Eliminar todos los insumos de la receta
      await tx.receta_insumos.deleteMany({
        where: { id_producto_final: idProductoFinal },
      });

      // Opcional: Limpiar notas de receta del producto
      await tx.productos.update({
        where: { id_producto: idProductoFinal },
        data: { receta: null },
      });

      return {
        mensaje: 'Receta eliminada exitosamente',
        id_producto_final: idProductoFinal,
      };
    });
  }

  /**
   * Explosión de materiales (BOM Explosion)
   * Obtiene todos los insumos necesarios para producir X cantidad de producto
   */
  async explosionMateriales(idProductoFinal: number, cantidad: number = 1) {
    const receta = await this.prisma.receta_insumos.findMany({
      where: { id_producto_final: idProductoFinal },
      include: {
        productos_receta_insumos_id_insumoToproductos: {
          include: {
            inventario: true,
          },
        },
        unidades_medida: true,
      },
    });

    if (receta.length === 0) {
      throw new NotFoundException(
        `No existe receta para el producto con ID ${idProductoFinal}`,
      );
    }

    const materialesNecesarios = receta.map((item) => {
      const cantidadTotal =
        Number(item.cantidad_necesaria) *
        cantidad *
        (1 + Number(item.merma_esperada_porcentaje) / 100);

      const insumo = item.productos_receta_insumos_id_insumoToproductos;
      const stockActual = insumo.inventario
        ? Number(insumo.inventario.stock_actual)
        : 0;
      const faltante = Math.max(0, cantidadTotal - stockActual);

      return {
        id_insumo: insumo.id_producto,
        nombre: insumo.nombre,
        cantidad_unitaria: Number(item.cantidad_necesaria),
        cantidad_total_necesaria: cantidadTotal,
        merma_porcentaje: Number(item.merma_esperada_porcentaje),
        unidad: item.unidades_medida.abreviatura,
        stock_actual: stockActual,
        faltante: faltante,
        costo_unitario: Number(insumo.costo_promedio || 0),
        costo_total: cantidadTotal * Number(insumo.costo_promedio || 0),
      };
    });

    const costoTotal = materialesNecesarios.reduce(
      (sum, item) => sum + item.costo_total,
      0,
    );

    return {
      id_producto_final: idProductoFinal,
      cantidad_producir: cantidad,
      materiales: materialesNecesarios,
      resumen: {
        costo_total: costoTotal,
        costo_unitario: costoTotal / cantidad,
        insumos_faltantes: materialesNecesarios.filter((m) => m.faltante > 0)
          .length,
        puede_producir: materialesNecesarios.every((m) => m.faltante === 0),
      },
    };
  }

  /**
   * Implosión de materiales (Where-Used)
   * Encuentra en qué productos se usa un insumo específico
   */
  async implosionMateriales(idInsumo: number) {
    const insumo = await this.prisma.productos.findUnique({
      where: { id_producto: idInsumo },
    });

    if (!insumo) {
      throw new NotFoundException(`Insumo con ID ${idInsumo} no encontrado`);
    }

    const usadoEn = await this.prisma.receta_insumos.findMany({
      where: { id_insumo: idInsumo },
      include: {
        productos_receta_insumos_id_producto_finalToproductos: {
          select: {
            id_producto: true,
            sku: true,
            nombre: true,
            precio_venta: true,
          },
        },
        unidades_medida: true,
      },
    });

    return {
      insumo: {
        id_producto: insumo.id_producto,
        nombre: insumo.nombre,
        costo_promedio: insumo.costo_promedio,
      },
      usado_en: usadoEn.map((item) => ({
        id_producto_final:
          item.productos_receta_insumos_id_producto_finalToproductos
            .id_producto,
        nombre_producto:
          item.productos_receta_insumos_id_producto_finalToproductos.nombre,
        sku: item.productos_receta_insumos_id_producto_finalToproductos.sku,
        cantidad_necesaria: Number(item.cantidad_necesaria),
        unidad: item.unidades_medida.abreviatura,
        merma_porcentaje: Number(item.merma_esperada_porcentaje),
      })),
      total_productos: usadoEn.length,
    };
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Calcular costo total de una receta
   */
  private async calcularCostoReceta(idProductoFinal: number): Promise<number> {
    const receta = await this.prisma.receta_insumos.findMany({
      where: { id_producto_final: idProductoFinal },
      include: {
        productos_receta_insumos_id_insumoToproductos: {
          select: {
            costo_promedio: true,
          },
        },
      },
    });

    const costoTotal = receta.reduce((total, item) => {
      const cantidad = Number(item.cantidad_necesaria);
      const merma = 1 + Number(item.merma_esperada_porcentaje) / 100;
      const costo = Number(
        item.productos_receta_insumos_id_insumoToproductos.costo_promedio || 0,
      );
      return total + cantidad * merma * costo;
    }, 0);

    return costoTotal;
  }

  /**
   * Calcular y actualizar el costo promedio del producto
   */
  private async calcularYActualizarCosto(tx: any, idProductoFinal: number) {
    const receta = await tx.receta_insumos.findMany({
      where: { id_producto_final: idProductoFinal },
      include: {
        productos_receta_insumos_id_insumoToproductos: {
          select: {
            costo_promedio: true,
          },
        },
      },
    });

    const costoTotal = receta.reduce((total, item) => {
      const cantidad = Number(item.cantidad_necesaria);
      const merma = 1 + Number(item.merma_esperada_porcentaje) / 100;
      const costo = Number(
        item.productos_receta_insumos_id_insumoToproductos.costo_promedio || 0,
      );
      return total + cantidad * merma * costo;
    }, 0);

    // Actualizar costo promedio del producto
    await tx.productos.update({
      where: { id_producto: idProductoFinal },
      data: {
        costo_promedio: new Prisma.Decimal(costoTotal.toFixed(4)),
      },
    });

    return costoTotal;
  }

  /**
   * Validar que un insumo existe y es válido
   */
  private async validarInsumo(idInsumo: number) {
    const insumo = await this.prisma.productos.findUnique({
      where: { id_producto: idInsumo },
    });

    if (!insumo) {
      throw new NotFoundException(`Insumo con ID ${idInsumo} no encontrado`);
    }

    if (!insumo.es_insumo) {
      throw new BadRequestException(
        `El producto ${insumo.nombre} no está marcado como insumo`,
      );
    }

    return insumo;
  }

  /**
   * Validar múltiples insumos
   */
  private async validarInsumos(
    insumos: Array<{ id_insumo: number; [key: string]: any }>,
  ) {
    const idsInsumos = insumos.map((i) => i.id_insumo);

    // Verificar duplicados
    const duplicados = idsInsumos.filter(
      (id, index) => idsInsumos.indexOf(id) !== index,
    );
    if (duplicados.length > 0) {
      throw new BadRequestException(
        `Insumos duplicados: ${duplicados.join(', ')}`,
      );
    }

    // Validar cada insumo
    await Promise.all(insumos.map((i) => this.validarInsumo(i.id_insumo)));
  }

  /**
   * Agrupar recetas por producto final
   */
  private agruparPorProducto(recetas: any[]): RecetaAgrupada[] {
    const agrupadas: Record<number, RecetaAgrupada> = {};

    for (const item of recetas) {
      const idProducto = item.id_producto_final;

      if (!agrupadas[idProducto]) {
        agrupadas[idProducto] = {
          id_producto_final: idProducto,
          producto: item.productos_receta_insumos_id_producto_finalToproductos,
          insumos: [],
        };
      }

      agrupadas[idProducto].insumos.push({
        id: item.id,
        insumo: item.productos_receta_insumos_id_insumoToproductos,
        cantidad_necesaria: item.cantidad_necesaria,
        unidad: item.unidades_medida,
        merma_esperada_porcentaje: item.merma_esperada_porcentaje,
        notas_preparacion: item.notas_preparacion,
      });
    }

    return Object.values(agrupadas);
  }
}
