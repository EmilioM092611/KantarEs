import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoCorteDto } from './dto/create-tipo-corte.dto';
import { UpdateTipoCorteDto } from './dto/update-tipo-corte.dto';

@Injectable()
export class TiposCorteService {
  constructor(private prisma: PrismaService) {}

  async create(createTipoCorteDto: CreateTipoCorteDto) {
    try {
      return await this.prisma.tipos_corte.create({
        data: createTipoCorteDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Ya existe un tipo de corte con ese nombre',
        );
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.tipos_corte.findMany({
      include: {
        _count: {
          select: { cortes_caja: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const tipoCorte = await this.prisma.tipos_corte.findUnique({
      where: { id_tipo_corte: id },
      include: {
        _count: {
          select: { cortes_caja: true },
        },
      },
    });

    if (!tipoCorte) {
      throw new NotFoundException(`Tipo de corte con ID ${id} no encontrado`);
    }

    return tipoCorte;
  }

  async update(id: number, updateTipoCorteDto: UpdateTipoCorteDto) {
    await this.findOne(id);

    try {
      return await this.prisma.tipos_corte.update({
        where: { id_tipo_corte: id },
        data: updateTipoCorteDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Ya existe un tipo de corte con ese nombre',
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    const tipoCorte = await this.findOne(id);

    // Verificar si tiene cortes asociados
    const cortesCount = await this.prisma.cortes_caja.count({
      where: { id_tipo_corte: id },
    });

    if (cortesCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el tipo de corte porque tiene ${cortesCount} corte(s) asociado(s).`,
      );
    }

    return await this.prisma.tipos_corte.delete({
      where: { id_tipo_corte: id },
    });
  }
}
