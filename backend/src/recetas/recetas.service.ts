// backend/src/productos/recetas/recetas.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';

@Injectable()
export class RecetasService {
  constructor(private readonly prisma: PrismaService) {}

  async getReceta(idProductoFinal: number) {
    // Verificar que el producto existe
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: idProductoFinal },
      select: {
        id_producto: true,
        nombre: true,
        sku: true,
        costo_promedio: true,
      },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Obtener líneas de receta
    const lineas = await this.prisma.receta_insumos.findMany({
      where: { id_producto_final: idProductoFinal },
      include: {
        productos_receta_insumos_id_insumoToproductos: {
          select: {
            id_producto: true,
            nombre: true,
            sku: true,
            costo_promedio: true,
          },
        },
        unidades_medida: {
          select: {
            id_unidad: true,
            nombre: true,
            abreviatura: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    return {
      producto_final: producto,
      lineas_receta: lineas.map((linea) => ({
        id: linea.id,
        insumo: linea.productos_receta_insumos_id_insumoToproductos,
        cantidad_necesaria: Number(linea.cantidad_necesaria),
        unidad_medida: linea.unidades_medida,
        merma_esperada_porcentaje: Number(linea.merma_esperada_porcentaje),
        notas_preparacion: linea.notas_preparacion,
        costo_linea:
          Number(linea.cantidad_necesaria) *
          Number(
            linea.productos_receta_insumos_id_insumoToproductos.costo_promedio,
          ),
      })),
      costo_total_calculado: lineas.reduce(
        (sum, linea) =>
          sum +
          Number(linea.cantidad_necesaria) *
            Number(
              linea.productos_receta_insumos_id_insumoToproductos
                .costo_promedio,
            ),
        0,
      ),
    };
  }

  async createReceta(idProductoFinal: number, dto: CreateRecetaDto) {
    // Verificar que el producto existe
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: idProductoFinal },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Validar que no haya ciclos
    for (const linea of dto.lineas) {
      if (linea.id_insumo === idProductoFinal) {
        throw new BadRequestException(
          'Un producto no puede ser insumo de sí mismo',
        );
      }
    }

    // Eliminar receta anterior si existe
    await this.prisma.receta_insumos.deleteMany({
      where: { id_producto_final: idProductoFinal },
    });

    // Crear nuevas líneas
    const lineasCreadas = await Promise.all(
      dto.lineas.map((linea) =>
        this.prisma.receta_insumos.create({
          data: {
            id_producto_final: idProductoFinal,
            id_insumo: linea.id_insumo,
            cantidad_necesaria: linea.cantidad_necesaria,
            id_unidad_medida: linea.id_unidad_medida,
            merma_esperada_porcentaje: linea.merma_esperada_porcentaje || 0,
            notas_preparacion: linea.notas_preparacion || null,
          },
          include: {
            productos_receta_insumos_id_insumoToproductos: true,
            unidades_medida: true,
          },
        }),
      ),
    );

    return {
      producto_final_id: idProductoFinal,
      lineas_creadas: lineasCreadas.length,
      lineas: lineasCreadas,
    };
  }

  async updateLineaReceta(idLinea: number, dto: UpdateRecetaDto) {
    const lineaExistente = await this.prisma.receta_insumos.findUnique({
      where: { id: idLinea },
    });

    if (!lineaExistente) {
      throw new NotFoundException('Línea de receta no encontrada');
    }

    const lineaActualizada = await this.prisma.receta_insumos.update({
      where: { id: idLinea },
      data: {
        cantidad_necesaria: dto.cantidad_necesaria,
        merma_esperada_porcentaje: dto.merma_esperada_porcentaje,
        notas_preparacion: dto.notas_preparacion,
      },
      include: {
        productos_receta_insumos_id_insumoToproductos: true,
        unidades_medida: true,
      },
    });

    return lineaActualizada;
  }

  async deleteLineaReceta(idLinea: number) {
    const linea = await this.prisma.receta_insumos.findUnique({
      where: { id: idLinea },
    });

    if (!linea) {
      throw new NotFoundException('Línea de receta no encontrada');
    }

    await this.prisma.receta_insumos.delete({
      where: { id: idLinea },
    });
  }

  async calcularCostoProduccion(idProductoFinal: number) {
    const receta = await this.getReceta(idProductoFinal);

    const costoInsumos = receta.lineas_receta.reduce(
      (sum, linea) => sum + linea.costo_linea,
      0,
    );

    const costoConMerma = receta.lineas_receta.reduce((sum, linea) => {
      const mermaDecimal = linea.merma_esperada_porcentaje / 100;
      const costoConMermaLinea = linea.costo_linea * (1 + mermaDecimal);
      return sum + costoConMermaLinea;
    }, 0);

    return {
      producto_id: idProductoFinal,
      producto_nombre: receta.producto_final.nombre,
      costo_insumos: costoInsumos,
      costo_con_merma: costoConMerma,
      diferencia_merma: costoConMerma - costoInsumos,
      margen_vs_precio_venta: receta.producto_final.costo_promedio
        ? ((Number(receta.producto_final.costo_promedio) - costoConMerma) /
            Number(receta.producto_final.costo_promedio)) *
          100
        : 0,
      lineas_detalle: receta.lineas_receta,
    };
  }

  async validarReceta(idProductoFinal: number) {
    const receta = await this.getReceta(idProductoFinal);
    const errores: string[] = [];
    const advertencias: string[] = [];

    // Validar que tenga al menos una línea
    if (receta.lineas_receta.length === 0) {
      advertencias.push('La receta no tiene líneas definidas');
    }

    // Validar que todos los insumos existan y estén activos
    for (const linea of receta.lineas_receta) {
      const insumo = await this.prisma.productos.findUnique({
        where: { id_producto: linea.insumo.id_producto },
      });

      if (!insumo) {
        errores.push(`Insumo ${linea.insumo.nombre} no existe`);
      } else if (!insumo.disponible) {
        advertencias.push(`Insumo ${linea.insumo.nombre} no está disponible`);
      }

      // Validar cantidades
      if (linea.cantidad_necesaria <= 0) {
        errores.push(`Cantidad inválida para insumo ${linea.insumo.nombre}`);
      }

      // Validar merma
      if (
        linea.merma_esperada_porcentaje < 0 ||
        linea.merma_esperada_porcentaje > 100
      ) {
        errores.push(`Merma inválida para insumo ${linea.insumo.nombre}`);
      }
    }

    // Validar ciclos (producto A requiere B, B requiere A)
    const cicloDetectado = await this.detectarCiclos(idProductoFinal);
    if (cicloDetectado) {
      errores.push('Se detectó un ciclo en la receta (dependencia circular)');
    }

    return {
      valida: errores.length === 0,
      errores,
      advertencias,
      total_lineas: receta.lineas_receta.length,
    };
  }

  private async detectarCiclos(
    idProducto: number,
    visitados: Set<number> = new Set(),
  ): Promise<boolean> {
    if (visitados.has(idProducto)) {
      return true; // Ciclo detectado
    }

    visitados.add(idProducto);

    const receta = await this.prisma.receta_insumos.findMany({
      where: { id_producto_final: idProducto },
      select: { id_insumo: true },
    });

    for (const linea of receta) {
      if (await this.detectarCiclos(linea.id_insumo, new Set(visitados))) {
        return true;
      }
    }

    return false;
  }
}
