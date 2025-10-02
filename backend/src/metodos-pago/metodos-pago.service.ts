import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';
import { FilterMetodoPagoDto } from './dto/filter-metodo-pago.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MetodosPagoService {
  constructor(private prisma: PrismaService) {}

  async create(createMetodoPagoDto: CreateMetodoPagoDto) {
    try {
      return await this.prisma.metodos_pago.create({
        data: {
          ...createMetodoPagoDto,
          comision_porcentaje: createMetodoPagoDto.comision_porcentaje
            ? new Prisma.Decimal(
                createMetodoPagoDto.comision_porcentaje.toString(),
              )
            : new Prisma.Decimal(0),
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Ya existe un método de pago con ese nombre',
        );
      }
      throw error;
    }
  }

  async findAll(filters?: FilterMetodoPagoDto) {
    const where: Prisma.metodos_pagoWhereInput = {};

    if (filters?.activo !== undefined) {
      where.activo = filters.activo;
    }

    if (filters?.requiere_referencia !== undefined) {
      where.requiere_referencia = filters.requiere_referencia;
    }

    if (filters?.requiere_autorizacion !== undefined) {
      where.requiere_autorizacion = filters.requiere_autorizacion;
    }

    return await this.prisma.metodos_pago.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const metodoPago = await this.prisma.metodos_pago.findUnique({
      where: { id_metodo_pago: id },
      include: {
        _count: {
          select: { pagos: true },
        },
      },
    });

    if (!metodoPago) {
      throw new NotFoundException(`Método de pago con ID ${id} no encontrado`);
    }

    return metodoPago;
  }

  async findActivos() {
    return await this.prisma.metodos_pago.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async update(id: number, updateMetodoPagoDto: UpdateMetodoPagoDto) {
    await this.findOne(id);

    try {
      return await this.prisma.metodos_pago.update({
        where: { id_metodo_pago: id },
        data: {
          ...updateMetodoPagoDto,
          comision_porcentaje: updateMetodoPagoDto.comision_porcentaje
            ? new Prisma.Decimal(
                updateMetodoPagoDto.comision_porcentaje.toString(),
              )
            : undefined,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Ya existe un método de pago con ese nombre',
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    const metodoPago = await this.findOne(id);

    // Verificar si tiene pagos asociados
    const pagosCount = await this.prisma.pagos.count({
      where: { id_metodo_pago: id },
    });

    if (pagosCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el método de pago porque tiene ${pagosCount} pago(s) asociado(s). Considere desactivarlo en su lugar.`,
      );
    }

    return await this.prisma.metodos_pago.delete({
      where: { id_metodo_pago: id },
    });
  }

  async toggleActivo(id: number) {
    const metodoPago = await this.findOne(id);

    return await this.prisma.metodos_pago.update({
      where: { id_metodo_pago: id },
      data: { activo: !metodoPago.activo },
    });
  }
}
