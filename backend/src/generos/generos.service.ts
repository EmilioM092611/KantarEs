// backend/src/generos/generos.service.ts - CORREGIDO
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';
import { QueryGenerosDto } from './dto/query-generos.dto';

@Injectable()
export class GenerosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryGenerosDto) {
    const { activo } = query;

    const where: any = {};

    // CORREGIDO: Manejo correcto de tipos
    if (activo !== undefined) {
      // Si activo es booleano, usarlo directamente
      // Si es string, convertir
      if (typeof activo === 'boolean') {
        where.activo = activo;
      } else if (typeof activo === 'string') {
        where.activo = activo === 'true';
      }
    }

    return this.prisma.generos.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const genero = await this.prisma.generos.findUnique({
      where: { id_genero: id },
    });

    if (!genero) {
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }

    return genero;
  }

  async create(createGeneroDto: CreateGeneroDto) {
    const existente = await this.prisma.generos.findFirst({
      where: {
        nombre: {
          equals: createGeneroDto.nombre,
          mode: 'insensitive',
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un género con el nombre "${createGeneroDto.nombre}"`,
      );
    }

    return this.prisma.generos.create({
      data: createGeneroDto,
    });
  }

  async update(id: number, updateGeneroDto: UpdateGeneroDto) {
    await this.findOne(id);

    if (updateGeneroDto.nombre) {
      const existente = await this.prisma.generos.findFirst({
        where: {
          nombre: {
            equals: updateGeneroDto.nombre,
            mode: 'insensitive',
          },
          id_genero: {
            not: id,
          },
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe otro género con el nombre "${updateGeneroDto.nombre}"`,
        );
      }
    }

    return this.prisma.generos.update({
      where: { id_genero: id },
      data: updateGeneroDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.generos.update({
      where: { id_genero: id },
      data: { activo: false },
    });
  }
}
