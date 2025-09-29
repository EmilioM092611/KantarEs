// ============== mesas.service.ts ==============
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { CambiarEstadoMesaDto } from './dto/cambiar-estado-mesa.dto';
import { QueryMesasDto } from './dto/query-mesas.dto';

@Injectable()
export class MesasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMesaDto: CreateMesaDto) {
    // Verificar que el número de mesa sea único
    const mesaExistente = await this.prisma.mesas.findUnique({
      where: { numero_mesa: createMesaDto.numero_mesa },
    });

    if (mesaExistente) {
      throw new ConflictException(
        `La mesa ${createMesaDto.numero_mesa} ya existe`,
      );
    }

    return this.prisma.mesas.create({
      data: {
        ...createMesaDto,
        id_estado_mesa: 1, // Disponible por defecto
        planta: createMesaDto.planta ?? 1,
        activa: createMesaDto.activa ?? true,
        requiere_limpieza: false,
      },
      include: {
        estados_mesa: true,
      },
    });
  }

  async findAll(query: QueryMesasDto) {
    const where: any = {};

    if (query.activa !== undefined) {
      where.activa = query.activa;
    }

    if (query.estado) {
      where.id_estado_mesa = query.estado;
    }

    if (query.ubicacion) {
      where.ubicacion = {
        contains: query.ubicacion,
        mode: 'insensitive',
      };
    }

    if (query.planta !== undefined) {
      where.planta = query.planta;
    }

    if (query.disponibles) {
      where.id_estado_mesa = 1; // Estado disponible
    }

    if (query.capacidad_min) {
      where.capacidad_personas = {
        gte: query.capacidad_min,
      };
    }

    return this.prisma.mesas.findMany({
      where,
      include: {
        estados_mesa: true,
        sesiones_mesa: {
          where: { estado: 'abierta' },
          include: {
            usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
              select: {
                id_usuario: true,
                username: true,
                personas: {
                  select: {
                    nombre: true,
                    apellido_paterno: true,
                  },
                },
              },
            },
            ordenes: {
              where: {
                estados_orden: {
                  nombre: {
                    notIn: ['pagada', 'cancelada'],
                  },
                },
              },
              select: {
                id_orden: true,
                total: true,
              },
            },
          },
        },
      },
      orderBy: [{ planta: 'asc' }, { numero_mesa: 'asc' }],
    });
  }

  async findDisponibles() {
    return this.prisma.mesas.findMany({
      where: {
        activa: true,
        id_estado_mesa: 1, // Disponible
      },
      include: {
        estados_mesa: true,
      },
      orderBy: [{ planta: 'asc' }, { numero_mesa: 'asc' }],
    });
  }

  async getMapa() {
    return this.prisma.mesas.findMany({
      where: {
        activa: true,
        coordenada_x: { not: null },
        coordenada_y: { not: null },
      },
      select: {
        id_mesa: true,
        numero_mesa: true,
        capacidad_personas: true,
        ubicacion: true,
        planta: true,
        coordenada_x: true,
        coordenada_y: true,
        estados_mesa: {
          select: {
            nombre: true,
            color_hex: true,
            icono: true,
          },
        },
        sesiones_mesa: {
          where: { estado: 'abierta' },
          select: {
            id_sesion: true,
            numero_comensales: true,
            fecha_hora_apertura: true,
            nombre_cliente: true,
          },
        },
      },
    });
  }

  async getEstadisticas() {
    const [
      totalMesas,
      mesasActivas,
      mesasOcupadas,
      mesasDisponibles,
      mesasPorLimpiar,
      capacidadTotal,
      comensalesActuales,
    ] = await Promise.all([
      this.prisma.mesas.count(),
      this.prisma.mesas.count({ where: { activa: true } }),
      this.prisma.mesas.count({ where: { id_estado_mesa: 2 } }), // Ocupada
      this.prisma.mesas.count({ where: { id_estado_mesa: 1, activa: true } }), // Disponible
      this.prisma.mesas.count({ where: { requiere_limpieza: true } }),
      this.prisma.mesas.aggregate({
        where: { activa: true },
        _sum: { capacidad_personas: true },
      }),
      this.prisma.sesiones_mesa.aggregate({
        where: { estado: 'abierta' },
        _sum: { numero_comensales: true },
      }),
    ]);

    const ocupacion =
      mesasActivas > 0 ? ((mesasOcupadas / mesasActivas) * 100).toFixed(2) : 0;

    return {
      total_mesas: totalMesas,
      mesas_activas: mesasActivas,
      mesas_ocupadas: mesasOcupadas,
      mesas_disponibles: mesasDisponibles,
      mesas_por_limpiar: mesasPorLimpiar,
      capacidad_total: capacidadTotal._sum.capacidad_personas || 0,
      comensales_actuales: comensalesActuales._sum.numero_comensales || 0,
      porcentaje_ocupacion: parseFloat(ocupacion as string),
    };
  }

  async findOne(id: number) {
    const mesa = await this.prisma.mesas.findUnique({
      where: { id_mesa: id },
      include: {
        estados_mesa: true,
        sesiones_mesa: {
          where: { estado: 'abierta' },
          include: {
            usuarios_sesiones_mesa_id_usuario_aperturaTousuarios: {
              select: {
                username: true,
                personas: true,
              },
            },
            ordenes: {
              include: {
                estados_orden: true,
              },
            },
          },
        },
      },
    });

    if (!mesa) {
      throw new NotFoundException(`Mesa con ID ${id} no encontrada`);
    }

    return mesa;
  }

  async update(id: number, updateMesaDto: UpdateMesaDto) {
    await this.findOne(id); // Verificar que existe

    return this.prisma.mesas.update({
      where: { id_mesa: id },
      data: updateMesaDto,
      include: {
        estados_mesa: true,
      },
    });
  }

  async cambiarEstado(id: number, cambiarEstadoDto: CambiarEstadoMesaDto) {
    const mesa = await this.findOne(id);

    // Verificar que el estado existe
    const estado = await this.prisma.estados_mesa.findUnique({
      where: { id_estado_mesa: cambiarEstadoDto.id_estado_mesa },
    });

    if (!estado) {
      throw new BadRequestException('Estado de mesa no válido');
    }

    // Si hay sesión activa, no permitir cambiar a disponible
    if (
      cambiarEstadoDto.id_estado_mesa === 1 &&
      mesa.sesiones_mesa.length > 0
    ) {
      throw new ConflictException(
        'No se puede marcar como disponible una mesa con sesión activa',
      );
    }

    return this.prisma.mesas.update({
      where: { id_mesa: id },
      data: {
        id_estado_mesa: cambiarEstadoDto.id_estado_mesa,
        requiere_limpieza: cambiarEstadoDto.requiere_limpieza,
      },
      include: {
        estados_mesa: true,
      },
    });
  }

  async limpiarMesa(id: number) {
    const mesa = await this.findOne(id);

    if (!mesa.requiere_limpieza) {
      throw new BadRequestException('La mesa no requiere limpieza');
    }

    return this.prisma.mesas.update({
      where: { id_mesa: id },
      data: {
        requiere_limpieza: false,
        id_estado_mesa: 1, // Disponible
      },
      include: {
        estados_mesa: true,
      },
    });
  }

  async remove(id: number) {
    const mesa = await this.findOne(id);

    // No permitir eliminar si hay sesiones activas
    if (mesa.sesiones_mesa.length > 0) {
      throw new ConflictException(
        'No se puede eliminar una mesa con sesiones activas',
      );
    }

    // Soft delete - solo marcar como inactiva
    return this.prisma.mesas.update({
      where: { id_mesa: id },
      data: {
        activa: false,
        updated_at: new Date(),
      },
    });
  }
}
