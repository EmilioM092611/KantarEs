/*
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecetaDto, RecetaLineaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecetasService {
  constructor(private readonly prisma: PrismaService) {}

  async createReceta(idProducto: number, dto: CreateRecetaDto) {
    // Verificar que el producto existe
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: idProducto },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar que no tenga receta existente
    const recetaExistente = await this.prisma.recetas.findFirst({
      where: { id_producto: idProducto },
    });

    if (recetaExistente) {
      throw new ConflictException('El producto ya tiene una receta asociada');
    }

    return this.prisma.$transaction(async (tx) => {
      // Crear receta principal
      const receta = await tx.recetas.create({
        data: {
          id_producto: idProducto,
          nombre: dto.nombre || `Receta de ${producto.nombre}`,
          descripcion: dto.descripcion,
          rendimiento: dto.rendimiento || 1,
          tiempo_preparacion: dto.tiempo_preparacion,
          costo_total: 0, // Se calculará después
        },
      });

      // Crear líneas de receta y calcular costo
      let costoTotal = new Prisma.Decimal(0);

      for (const linea of dto.lineas) {
        // Verificar que el insumo existe
        const insumo = await tx.productos.findUnique({
          where: { id_producto: linea.id_insumo },
          include: { inventario: true },
        });

        if (!insumo) {
          throw new NotFoundException(
            `Insumo con ID ${linea.id_insumo} no encontrado`,
          );
        }

        const costoUnitario = insumo.costo_unitario || new Prisma.Decimal(0);
        const costoLinea = costoUnitario.mul(linea.cantidad);
        costoTotal = costoTotal.add(costoLinea);

        await tx.receta_lineas.create({
          data: {
            id_receta: receta.id_receta,
            id_insumo: linea.id_insumo,
            cantidad: linea.cantidad,
            id_unidad_medida: linea.id_unidad_medida || insumo.id_unidad_medida,
            costo_linea: costoLinea,
            notas: linea.notas,
          },
        });
      }

      // Actualizar costo total
      const recetaFinal = await tx.recetas.update({
        where: { id_receta: receta.id_receta },
        data: { costo_total: costoTotal },
        include: {
          receta_lineas: {
            include: {
              productos: true,
              unidades_medida: true,
            },
          },
        },
      });

      return recetaFinal;
    });
  }

  async getRecetaByProducto(idProducto: number) {
    const receta = await this.prisma.recetas.findFirst({
      where: { id_producto: idProducto },
      include: {
        productos: true,
        receta_lineas: {
          include: {
            productos: true,
            unidades_medida: true,
          },
        },
      },
    });

    if (!receta) {
      throw new NotFoundException('Receta no encontrada para este producto');
    }

    return receta;
  }

  async updateReceta(idProducto: number, dto: UpdateRecetaDto) {
    const receta = await this.prisma.recetas.findFirst({
      where: { id_producto: idProducto },
    });

    if (!receta) {
      throw new NotFoundException('Receta no encontrada');
    }

    return this.prisma.$transaction(async (tx) => {
      // Actualizar datos principales
      await tx.recetas.update({
        where: { id_receta: receta.id_receta },
        data: {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          rendimiento: dto.rendimiento,
          tiempo_preparacion: dto.tiempo_preparacion,
        },
      });

      // Si hay líneas nuevas, actualizar
      if (dto.lineas && dto.lineas.length > 0) {
        // Eliminar líneas existentes
        await tx.receta_lineas.deleteMany({
          where: { id_receta: receta.id_receta },
        });

        // Crear nuevas líneas
        let costoTotal = new Prisma.Decimal(0);

        for (const linea of dto.lineas) {
          const insumo = await tx.productos.findUnique({
            where: { id_producto: linea.id_insumo },
          });

          if (!insumo) {
            throw new NotFoundException(
              `Insumo con ID ${linea.id_insumo} no encontrado`,
            );
          }

          const costoUnitario = insumo.costo_unitario || new Prisma.Decimal(0);
          const costoLinea = costoUnitario.mul(linea.cantidad);
          costoTotal = costoTotal.add(costoLinea);

          await tx.receta_lineas.create({
            data: {
              id_receta: receta.id_receta,
              id_insumo: linea.id_insumo,
              cantidad: linea.cantidad,
              id_unidad_medida:
                linea.id_unidad_medida || insumo.id_unidad_medida,
              costo_linea: costoLinea,
              notas: linea.notas,
            },
          });
        }

        // Actualizar costo total
        await tx.recetas.update({
          where: { id_receta: receta.id_receta },
          data: { costo_total: costoTotal },
        });
      }

      return this.getRecetaByProducto(idProducto);
    });
  }

  async deleteReceta(idProducto: number) {
    const receta = await this.prisma.recetas.findFirst({
      where: { id_producto: idProducto },
    });

    if (!receta) {
      throw new NotFoundException('Receta no encontrada');
    }

    await this.prisma.$transaction(async (tx) => {
      // Eliminar líneas
      await tx.receta_lineas.deleteMany({
        where: { id_receta: receta.id_receta },
      });

      // Eliminar receta
      await tx.recetas.delete({
        where: { id_receta: receta.id_receta },
      });
    });

    return { message: 'Receta eliminada exitosamente' };
  }

  async calcularCostoReceta(idProducto: number) {
    const receta = await this.getRecetaByProducto(idProducto);

    let costoTotal = new Prisma.Decimal(0);
    const detallesCosto = [];

    for (const linea of receta.receta_lineas) {
      const costoLinea = linea.costo_linea || new Prisma.Decimal(0);
      costoTotal = costoTotal.add(costoLinea);

      detallesCosto.push({
        insumo: linea.productos.nombre,
        cantidad: linea.cantidad,
        unidad: linea.unidades_medida.abreviatura,
        costo: costoLinea.toNumber(),
      });
    }

    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: idProducto },
    });

    const precioVenta = producto?.precio_venta || new Prisma.Decimal(0);
    const margen = precioVenta.sub(costoTotal);
    const margenPorcentaje = precioVenta.gt(0)
      ? margen.div(precioVenta).mul(100)
      : new Prisma.Decimal(0);

    return {
      id_producto: idProducto,
      producto: producto?.nombre,
      costo_total: costoTotal.toNumber(),
      precio_venta: precioVenta.toNumber(),
      margen: margen.toNumber(),
      margen_porcentaje: margenPorcentaje.toNumber(),
      rendimiento: receta.rendimiento,
      costo_por_porcion: costoTotal.div(receta.rendimiento || 1).toNumber(),
      detalle: detallesCosto,
    };
  }

  async descontarInsumosPorVenta(idProducto: number, cantidad: number) {
    const receta = await this.getRecetaByProducto(idProducto);

    if (!receta) {
      return null; // No tiene receta, no descontar insumos
    }

    return this.prisma.$transaction(async (tx) => {
      const movimientos = [];

      for (const linea of receta.receta_lineas) {
        const cantidadDescontar = linea.cantidad.mul(cantidad);

        // Verificar inventario del insumo
        const inventarioInsumo = await tx.inventario.findFirst({
          where: { id_producto: linea.id_insumo },
        });

        if (!inventarioInsumo) {
          throw new BadRequestException(
            `No hay inventario para el insumo ${linea.productos.nombre}`,
          );
        }

        if (inventarioInsumo.stock_actual.lt(cantidadDescontar)) {
          throw new BadRequestException(
            `Stock insuficiente del insumo ${linea.productos.nombre}`,
          );
        }

        // Actualizar inventario
        await tx.inventario.update({
          where: { id_inventario: inventarioInsumo.id_inventario },
          data: {
            stock_actual: inventarioInsumo.stock_actual.sub(cantidadDescontar),
          },
        });

        // Registrar movimiento
        const tipoSalida = await tx.tipos_movimiento.findFirst({
          where: { nombre: 'Salida por producción' },
        });

        if (tipoSalida) {
          const movimiento = await tx.movimientos_inventario.create({
            data: {
              id_tipo_movimiento: tipoSalida.id_tipo_movimiento,
              id_producto: linea.id_insumo,
              cantidad: cantidadDescontar,
              id_unidad_medida: linea.id_unidad_medida,
              id_usuario: 1, // TODO: Pasar usuario real
              fecha_movimiento: new Date(),
              observaciones: `Salida por producción de ${producto.nombre}`,
            },
          });
          movimientos.push(movimiento);
        }
      }

      return movimientos;
    });
  }
}
*/
