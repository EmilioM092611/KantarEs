import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnidadDto } from './dto/create-unidad.dto';
import { UpdateUnidadDto } from './dto/update-unidad.dto';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheUtil } from '../cache/cache-util.service';

@Injectable()
export class UnidadesService {
  private readonly DEFAULT_TTL = 1_800_000; // 30 min

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly cacheUtil: CacheUtil,
  ) {}

  // Keys
  private keyList() {
    return 'unidades:list:all';
  }
  private keyByTipo(tipo: string) {
    return `unidades:list:tipo:${(tipo ?? '').toLowerCase()}`;
  }
  private keyById(id: number) {
    return `unidades:id:${id}`;
  }
  private async invalidateAllUnidadCaches() {
    await this.cacheUtil.invalidate({
      patterns: ['unidades:list:*'],
    });
  }

  async create(createUnidadDto: CreateUnidadDto) {
    const existing = await this.prisma.unidades_medida.findUnique({
      where: { abreviatura: createUnidadDto.abreviatura },
    });
    if (existing) {
      throw new ConflictException(
        `La abreviatura ${createUnidadDto.abreviatura} ya está en uso`,
      );
    }

    const unidad = await this.prisma.unidades_medida.create({
      data: {
        ...createUnidadDto,
        factor_conversion: new Prisma.Decimal(
          createUnidadDto.factor_conversion || 1,
        ),
      },
    });

    await this.cache.set(
      this.keyById(unidad.id_unidad),
      unidad,
      this.DEFAULT_TTL,
    );
    await this.invalidateAllUnidadCaches();
    return unidad;
  }

  async findAll() {
    const key = this.keyList();
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.unidades_medida.findMany({
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    });

    await this.cache.set(key, data, this.DEFAULT_TTL);
    return data;
  }

  async findByTipo(tipo: string) {
    const key = this.keyByTipo(tipo);
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const data = await this.prisma.unidades_medida.findMany({
      where: { tipo: tipo as any },
      orderBy: { nombre: 'asc' },
    });

    await this.cache.set(key, data, this.DEFAULT_TTL);
    return data;
  }

  async findOne(id: number) {
    const key = this.keyById(id);
    const cached = await this.cache.get<any>(key);
    if (cached) return cached;

    const unidad = await this.prisma.unidades_medida.findUnique({
      where: { id_unidad: id },
      include: { _count: { select: { productos: true } } },
    });

    if (!unidad) {
      throw new NotFoundException(
        `Unidad de medida con ID ${id} no encontrada`,
      );
    }

    await this.cache.set(key, unidad, this.DEFAULT_TTL);
    return unidad;
  }

  async update(id: number, updateUnidadDto: UpdateUnidadDto) {
    await this.findOne(id);

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

    const unidad = await this.prisma.unidades_medida.update({
      where: { id_unidad: id },
      data: updateData,
    });

    await this.cache.set(this.keyById(id), unidad, this.DEFAULT_TTL);
    await this.invalidateAllUnidadCaches();
    return unidad;
  }

  async remove(id: number) {
    await this.findOne(id);

    const productosCount = await this.prisma.productos.count({
      where: { id_unidad_medida: id },
    });

    if (productosCount > 0) {
      throw new BadRequestException(
        `No se puede eliminar la unidad porque hay ${productosCount} productos usándola`,
      );
    }

    const eliminado = await this.prisma.unidades_medida.delete({
      where: { id_unidad: id },
    });

    await this.cacheUtil.invalidate({
      keys: [this.keyById(id)],
      patterns: ['unidades:list:*'],
    });

    return eliminado;
  }
}
