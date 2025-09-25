import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UnidadesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUnidadDto: CreateUnidadDto) {
    // Verificar que la abreviatura sea única
    const existing = await this.prisma.unidades_medida.findUnique({
      where: { abreviatura: createUnidadDto.abreviatura },
    });

    if (existing) {
      throw new ConflictException(
        `La abreviatura ${createUnidadDto.abreviatura} ya está en uso`,
      );
    }

    return this.prisma.unidades_medida.create({
      data: {
        ...createUnidadDto,
        factor_conversion: new Prisma.Decimal(
          createUnidadDto.factor_conversion || 1,
        ),
      },
    });
  }

  async findAll() {
    return this.prisma.unidades_medida.findMany({
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findByTipo(tipo: string) {
    return this.prisma.unidades_medida.findMany({
      where: { tipo: tipo as any },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const unidad = await this.prisma.unidades_medida.findUnique({
      where: { id_unidad: id },
      include: {
        _count: {
          select: { productos: true },
        },
      },
    });

    if (!unidad) {
      throw new NotFoundException(
        `Unidad de medida con ID ${id} no encontrada`,
      );
    }

    return unidad;
  }

  async update(id: number, updateUnidadDto: UpdateUnidadDto) {
    await this.findOne(id);

    // Si se actualiza la abreviatura, verificar que sea única
    if (updateUnidadDto.abreviatura) {
      const existing = await this.prisma.unidades_medida.findFirst({
        where: {
          abreviatura: updateUnidadDto.abreviatura,
          NOT: { id_unidad: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `La abreviatura ${updateUnidadDto.abreviatura} ya está en uso`,
        );
      }
    }

    const updateData: any = { ...updateUnidadDto };
    if (updateUnidadDto.factor_conversion !== undefined) {
      updateData.factor_conversion = new Prisma.Decimal(
        updateUnidadDto.factor_conversion,
      );
    }

    return this.prisma.unidades_medida.update({
      where: { id_unidad: id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const unidad = await this.findOne(id);

    // Verificar si hay productos usando esta unidad
    const productosCount = await this.prisma.productos.count({
      where: { id_unidad_medida: id },
    });

    if (productosCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar la unidad porque hay ${productosCount} productos usándola`,
      );
    }

    return this.prisma.unidades_medida.delete({
      where: { id_unidad: id },
    });
  }
}
