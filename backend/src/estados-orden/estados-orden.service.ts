/* eslint-disable @typescript-eslint/require-await */
// backend/src/estados-orden/estados-orden.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstadoOrdenDto } from './dto/create-estado-orden.dto';
import { UpdateEstadoOrdenDto } from './dto/update-estado-orden.dto';

@Injectable()
export class EstadosOrdenService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.estados_orden.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const estado = await this.prisma.estados_orden.findUnique({
      where: { id_estado_orden: id },
    });

    if (!estado) {
      throw new NotFoundException(`Estado de orden con ID ${id} no encontrado`);
    }

    return estado;
  }

  async create(createEstadoOrdenDto: CreateEstadoOrdenDto) {
    // Verificar que no exista otro estado con el mismo nombre
    const existente = await this.prisma.estados_orden.findUnique({
      where: { nombre: createEstadoOrdenDto.nombre },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un estado con el nombre "${createEstadoOrdenDto.nombre}"`,
      );
    }

    return this.prisma.estados_orden.create({
      data: createEstadoOrdenDto,
    });
  }

  async update(id: number, updateEstadoOrdenDto: UpdateEstadoOrdenDto) {
    await this.findOne(id); // Verificar que existe

    // Si se actualiza el nombre, verificar que no exista otro con ese nombre
    if (updateEstadoOrdenDto.nombre) {
      const existente = await this.prisma.estados_orden.findFirst({
        where: {
          nombre: updateEstadoOrdenDto.nombre,
          id_estado_orden: { not: id },
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe otro estado con el nombre "${updateEstadoOrdenDto.nombre}"`,
        );
      }
    }

    return this.prisma.estados_orden.update({
      where: { id_estado_orden: id },
      data: updateEstadoOrdenDto,
    });
  }

  /**
   * Busca un estado por nombre (útil para migraciones y procesos internos)
   * IMPORTANTE: Usar esta función en lugar de comparaciones por string
   */
  async findByNombre(nombre: string) {
    return this.prisma.estados_orden.findUnique({
      where: { nombre },
    });
  }

  /**
   * Obtiene el ID de un estado por su nombre
   * Útil para normalización de estados (Sprint 1 - Mejora 1)
   */
  async getIdByNombre(nombre: string): Promise<number> {
    const estado = await this.findByNombre(nombre);

    if (!estado) {
      throw new NotFoundException(`Estado "${nombre}" no encontrado`);
    }

    return estado.id_estado_orden;
  }

  /**
   * Verifica si un estado es final (Pagada, Cancelada)
   * Útil para validaciones de negocio
   */
  async isEstadoFinal(idEstado: number): Promise<boolean> {
    const estado = await this.findOne(idEstado);
    const estadosFinales = ['Pagada', 'Cancelada'];
    return estadosFinales.includes(estado.nombre);
  }

  /**
   * Obtiene estados válidos para transición desde un estado dado
   */
  async getEstadosValidosDesde(estadoActual: string): Promise<string[]> {
    // Definir flujo de estados permitidos
    const transiciones: Record<string, string[]> = {
      Pendiente: ['En Preparación', 'Cancelada'],
      'En Preparación': ['Lista', 'Cancelada'],
      Lista: ['Entregada', 'Cancelada'],
      Entregada: ['Pagada'],
      Pagada: [], // Estado final
      Cancelada: [], // Estado final
    };

    return transiciones[estadoActual] || [];
  }
}
