import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MermasService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: {
    id_producto: number;
    cantidad: string | number;
    motivo?: string;
    evidencia_url?: string;
    id_usuario: number;
    id_tipo_movimiento: number;
  }) {
    const prod = await this.prisma.productos.findUnique({
      where: { id_producto: Number(dto.id_producto) },
    });
    if (!prod) throw new BadRequestException('Producto no encontrado');

    return this.prisma.movimientos_inventario.create({
      data: {
        id_tipo_movimiento: Number(dto.id_tipo_movimiento),
        id_producto: Number(dto.id_producto),
        id_usuario: Number(dto.id_usuario),
        cantidad: (dto.cantidad ?? '0') as any,
        id_unidad_medida: prod.id_unidad_medida,
        fecha_movimiento: new Date(),
        observaciones: dto.motivo ?? null,
        // evidencia_url no existe en tu modelo movimientos_inventario → si lo necesitas, guárdalo en otra tabla o en Observaciones
        id_orden: null,
        id_compra: null,
      },
    });
  }
}
