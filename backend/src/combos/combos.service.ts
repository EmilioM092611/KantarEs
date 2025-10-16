// backend/src/combos/combos.service.ts - CORREGIDO
// Solo muestro las partes que necesitan corrección

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComboDto } from './dto/create-combo.dto';

@Injectable()
export class CombosService {
  constructor(private readonly prisma: PrismaService) {}

  async getCombo(idProductoCombo: number) {
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: idProductoCombo },
      select: {
        id_producto: true,
        nombre: true,
        sku: true,
        precio_venta: true,
      },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const componentes = await this.prisma.producto_combo.findMany({
      where: { id_producto_combo: idProductoCombo },
      include: {
        // CORREGIDO: Nombre de relación correcto según tu schema
        productos_producto_combo_id_producto_componenteToproductos: {
          select: {
            id_producto: true,
            nombre: true,
            sku: true,
            precio_venta: true,
            disponible: true,
          },
        },
      },
      orderBy: { orden_visualizacion: 'asc' },
    });

    return {
      producto_combo: producto,
      componentes: componentes.map((comp) => ({
        id: comp.id,
        // CORREGIDO: Usar el nombre correcto
        producto:
          comp.productos_producto_combo_id_producto_componenteToproductos,
        cantidad: Number(comp.cantidad),
        es_opcional: comp.es_opcional,
        precio_adicional: Number(comp.precio_adicional),
        grupo_opciones: comp.grupo_opciones,
        orden_visualizacion: comp.orden_visualizacion,
      })),
      total_componentes: componentes.length,
    };
  }

  async createCombo(idProductoCombo: number, dto: CreateComboDto) {
    const producto = await this.prisma.productos.findUnique({
      where: { id_producto: idProductoCombo },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Validar componentes
    for (const comp of dto.componentes) {
      if (comp.id_producto_componente === idProductoCombo) {
        throw new BadRequestException(
          'Un combo no puede contener a sí mismo como componente',
        );
      }

      const componente = await this.prisma.productos.findUnique({
        where: { id_producto: comp.id_producto_componente },
      });

      if (!componente) {
        throw new NotFoundException(
          `Componente con ID ${comp.id_producto_componente} no encontrado`,
        );
      }
    }

    // Eliminar componentes anteriores
    await this.prisma.producto_combo.deleteMany({
      where: { id_producto_combo: idProductoCombo },
    });

    // Crear nuevos componentes
    const componentesCreados = await Promise.all(
      dto.componentes.map((comp, index) =>
        this.prisma.producto_combo.create({
          data: {
            id_producto_combo: idProductoCombo,
            id_producto_componente: comp.id_producto_componente,
            cantidad: comp.cantidad,
            es_opcional: comp.es_opcional || false,
            precio_adicional: comp.precio_adicional || 0,
            grupo_opciones: comp.grupo_opciones || null,
            orden_visualizacion: comp.orden_visualizacion ?? index + 1,
          },
          include: {
            // CORREGIDO: Nombre correcto
            productos_producto_combo_id_producto_componenteToproductos: true,
          },
        }),
      ),
    );

    return {
      producto_combo_id: idProductoCombo,
      componentes_creados: componentesCreados.length,
      componentes: componentesCreados,
    };
  }

  // ... resto de los métodos igual, solo cambiando los nombres de relación
  // donde aparezca producto_combo_producto_combo_id_producto_componenteToproductos
  // cambiar por productos_producto_combo_id_producto_componenteToproductos

  async deleteComponente(idComponente: number) {
    const componente = await this.prisma.producto_combo.findUnique({
      where: { id: idComponente },
    });

    if (!componente) {
      throw new NotFoundException('Componente de combo no encontrado');
    }

    await this.prisma.producto_combo.delete({
      where: { id: idComponente },
    });
  }

  async calcularPrecioCombo(idProductoCombo: number) {
    const combo = await this.getCombo(idProductoCombo);

    const precioComponentes = combo.componentes.reduce((sum, comp) => {
      if (!comp.es_opcional) {
        return (
          sum +
          Number(comp.producto.precio_venta) * comp.cantidad +
          Number(comp.precio_adicional)
        );
      }
      return sum;
    }, 0);

    const precioActualCombo = Number(combo.producto_combo.precio_venta);
    const descuento = precioComponentes - precioActualCombo;
    const porcentajeDescuento =
      precioComponentes > 0 ? (descuento / precioComponentes) * 100 : 0;

    return {
      producto_combo_id: idProductoCombo,
      producto_nombre: combo.producto_combo.nombre,
      precio_componentes_separados: precioComponentes,
      precio_combo_actual: precioActualCombo,
      ahorro_cliente: descuento,
      porcentaje_descuento: porcentajeDescuento,
      componentes_detalle: combo.componentes.map((comp) => ({
        nombre: comp.producto.nombre,
        cantidad: comp.cantidad,
        precio_unitario: Number(comp.producto.precio_venta),
        precio_total: Number(comp.producto.precio_venta) * comp.cantidad,
        es_opcional: comp.es_opcional,
        precio_adicional: Number(comp.precio_adicional),
      })),
    };
  }

  async validarCombo(idProductoCombo: number) {
    const combo = await this.getCombo(idProductoCombo);
    const errores: string[] = [];
    const advertencias: string[] = [];

    if (combo.componentes.length === 0) {
      advertencias.push('El combo no tiene componentes definidos');
    }

    // Validar disponibilidad de componentes
    for (const comp of combo.componentes) {
      if (!comp.producto.disponible) {
        if (comp.es_opcional) {
          advertencias.push(
            `Componente opcional ${comp.producto.nombre} no está disponible`,
          );
        } else {
          errores.push(
            `Componente obligatorio ${comp.producto.nombre} no está disponible`,
          );
        }
      }

      // Validar inventario si es inventariable
      const productoCompleto = await this.prisma.productos.findUnique({
        where: { id_producto: comp.producto.id_producto },
        include: { inventario: true },
      });

      if (productoCompleto?.es_inventariable && productoCompleto.inventario) {
        const stockActual = Number(productoCompleto.inventario.stock_actual);
        if (stockActual < comp.cantidad) {
          errores.push(
            `Stock insuficiente para ${comp.producto.nombre}. Requerido: ${comp.cantidad}, Disponible: ${stockActual}`,
          );
        }
      }
    }

    // Validar precio del combo
    const precioCalc = await this.calcularPrecioCombo(idProductoCombo);
    if (
      precioCalc.precio_combo_actual >= precioCalc.precio_componentes_separados
    ) {
      advertencias.push(
        'El precio del combo no representa ahorro para el cliente',
      );
    }

    return {
      valido: errores.length === 0,
      disponible_para_venta: errores.length === 0,
      errores,
      advertencias,
      total_componentes: combo.componentes.length,
      componentes_obligatorios: combo.componentes.filter((c) => !c.es_opcional)
        .length,
      componentes_opcionales: combo.componentes.filter((c) => c.es_opcional)
        .length,
    };
  }
}
