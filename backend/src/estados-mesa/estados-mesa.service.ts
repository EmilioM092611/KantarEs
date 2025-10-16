// backend/src/estados-mesa/estados-mesa.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstadoMesaDto } from './dto/create-estado-mesa.dto';
import { UpdateEstadoMesaDto } from './dto/update-estado-mesa.dto';

@Injectable()
export class EstadosMesaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.estados_mesa.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const estado = await this.prisma.estados_mesa.findUnique({
      where: { id_estado_mesa: id },
    });

    if (!estado) {
      throw new NotFoundException(`Estado de mesa con ID ${id} no encontrado`);
    }

    return estado;
  }

  async create(createEstadoMesaDto: CreateEstadoMesaDto) {
    // Verificar que no exista otro estado con el mismo nombre
    const existente = await this.prisma.estados_mesa.findUnique({
      where: { nombre: createEstadoMesaDto.nombre },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un estado con el nombre "${createEstadoMesaDto.nombre}"`,
      );
    }

    return this.prisma.estados_mesa.create({
      data: createEstadoMesaDto,
    });
  }

  async update(id: number, updateEstadoMesaDto: UpdateEstadoMesaDto) {
    await this.findOne(id); // Verificar que existe

    // Si se actualiza el nombre, verificar que no exista otro con ese nombre
    if (updateEstadoMesaDto.nombre) {
      const existente = await this.prisma.estados_mesa.findFirst({
        where: {
          nombre: updateEstadoMesaDto.nombre,
          id_estado_mesa: { not: id },
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe otro estado con el nombre "${updateEstadoMesaDto.nombre}"`,
        );
      }
    }

    return this.prisma.estados_mesa.update({
      where: { id_estado_mesa: id },
      data: updateEstadoMesaDto,
    });
  }

  /**
   * Busca un estado por nombre (útil para migraciones y procesos internos)
   */
  async findByNombre(nombre: string) {
    return this.prisma.estados_mesa.findUnique({
      where: { nombre },
    });
  }

  /**
   * Obtiene el ID de un estado por su nombre
   */
  async getIdByNombre(nombre: string): Promise<number> {
    const estado = await this.findByNombre(nombre);

    if (!estado) {
      throw new NotFoundException(`Estado "${nombre}" no encontrado`);
    }

    return estado.id_estado_mesa;
  }
}
