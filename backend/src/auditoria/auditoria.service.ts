import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { FilterAuditoriaDto } from './dto/filter-auditoria.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuditoriaDto: CreateAuditoriaDto) {
    // Validar que el usuario existe
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: createAuditoriaDto.id_usuario },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${createAuditoriaDto.id_usuario} no encontrado`,
      );
    }

    try {
      return await this.prisma.auditoria_sistema.create({
        data: {
          ...createAuditoriaDto,
          fecha_hora: new Date(),
        },
        include: {
          usuarios: {
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
        },
      });
    } catch (error) {
      throw new BadRequestException('Error al crear el registro de auditoría');
    }
  }

  async findAll(filters: FilterAuditoriaDto) {
    const {
      tabla_afectada,
      id_registro,
      accion,
      id_usuario,
      ip_address,
      fecha_desde,
      fecha_hasta,
      page = 1,
      limit = 20,
      sortBy = 'fecha_hora',
      sortOrder = 'desc',
    } = filters;

    const where: Prisma.auditoria_sistemaWhereInput = {
      AND: [
        tabla_afectada
          ? {
              tabla_afectada: { contains: tabla_afectada, mode: 'insensitive' },
            }
          : {},
        id_registro ? { id_registro } : {},
        accion ? { accion } : {},
        id_usuario ? { id_usuario } : {},
        ip_address ? { ip_address } : {},
        fecha_desde ? { fecha_hora: { gte: new Date(fecha_desde) } } : {},
        fecha_hasta ? { fecha_hora: { lte: new Date(fecha_hasta) } } : {},
      ],
    };

    const [data, total] = await Promise.all([
      this.prisma.auditoria_sistema.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          usuarios: {
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
        },
      }),
      this.prisma.auditoria_sistema.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const auditoria = await this.prisma.auditoria_sistema.findUnique({
      where: { id_auditoria: BigInt(id) },
      include: {
        usuarios: {
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
      },
    });

    if (!auditoria) {
      throw new NotFoundException(
        `Registro de auditoría con ID ${id} no encontrado`,
      );
    }

    return auditoria;
  }

  async findByTablaAndRegistro(tabla: string, id_registro: number) {
    const auditorias = await this.prisma.auditoria_sistema.findMany({
      where: {
        tabla_afectada: tabla,
        id_registro,
      },
      orderBy: { fecha_hora: 'desc' },
      include: {
        usuarios: {
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
      },
    });

    return {
      tabla_afectada: tabla,
      id_registro,
      total_cambios: auditorias.length,
      historial: auditorias,
    };
  }

  async findByUsuario(id_usuario: number, limit: number = 50) {
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id_usuario} no encontrado`);
    }

    const auditorias = await this.prisma.auditoria_sistema.findMany({
      where: { id_usuario },
      orderBy: { fecha_hora: 'desc' },
      take: limit,
    });

    return {
      usuario: {
        id_usuario: usuario.id_usuario,
        username: usuario.username,
      },
      total_acciones: auditorias.length,
      acciones_recientes: auditorias,
    };
  }

  async findByTabla(tabla: string, limit: number = 100) {
    const auditorias = await this.prisma.auditoria_sistema.findMany({
      where: { tabla_afectada: tabla },
      orderBy: { fecha_hora: 'desc' },
      take: limit,
      include: {
        usuarios: {
          select: {
            id_usuario: true,
            username: true,
          },
        },
      },
    });

    // Agrupar por acción
    const porAccion = {
      INSERT: auditorias.filter((a) => a.accion === 'INSERT').length,
      UPDATE: auditorias.filter((a) => a.accion === 'UPDATE').length,
      DELETE: auditorias.filter((a) => a.accion === 'DELETE').length,
    };

    return {
      tabla_afectada: tabla,
      total_cambios: auditorias.length,
      cambios_por_accion: porAccion,
      cambios_recientes: auditorias,
    };
  }

  async getEstadisticas() {
    // Total de registros
    const total = await this.prisma.auditoria_sistema.count();

    // Por acción
    const porAccion = await Promise.all([
      this.prisma.auditoria_sistema.count({ where: { accion: 'INSERT' } }),
      this.prisma.auditoria_sistema.count({ where: { accion: 'UPDATE' } }),
      this.prisma.auditoria_sistema.count({ where: { accion: 'DELETE' } }),
    ]);

    // Últimas 24 horas
    const hace24h = new Date();
    hace24h.setHours(hace24h.getHours() - 24);
    const ultimas24h = await this.prisma.auditoria_sistema.count({
      where: { fecha_hora: { gte: hace24h } },
    });

    // Últimos 7 días
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);
    const ultimos7dias = await this.prisma.auditoria_sistema.count({
      where: { fecha_hora: { gte: hace7dias } },
    });

    // Tablas más auditadas
    const tablasMasAuditadas = await this.prisma.auditoria_sistema.groupBy({
      by: ['tabla_afectada'],
      _count: {
        tabla_afectada: true,
      },
      orderBy: {
        _count: {
          tabla_afectada: 'desc',
        },
      },
      take: 10,
    });

    // Usuarios más activos
    const usuariosMasActivos = await this.prisma.auditoria_sistema.groupBy({
      by: ['id_usuario'],
      _count: {
        id_usuario: true,
      },
      orderBy: {
        _count: {
          id_usuario: 'desc',
        },
      },
      take: 10,
    });

    // Obtener nombres de usuarios más activos
    const usuariosInfo = await this.prisma.usuarios.findMany({
      where: {
        id_usuario: {
          in: usuariosMasActivos.map((u) => u.id_usuario),
        },
      },
      select: {
        id_usuario: true,
        username: true,
      },
    });

    const usuariosConConteo = usuariosMasActivos.map((u) => ({
      ...usuariosInfo.find((ui) => ui.id_usuario === u.id_usuario),
      total_acciones: u._count.id_usuario,
    }));

    return {
      total_registros: total,
      registros_por_accion: {
        INSERT: porAccion[0],
        UPDATE: porAccion[1],
        DELETE: porAccion[2],
      },
      actividad_reciente: {
        ultimas_24h: ultimas24h,
        ultimos_7_dias: ultimos7dias,
      },
      tablas_mas_auditadas: tablasMasAuditadas.map((t) => ({
        tabla: t.tabla_afectada,
        total_cambios: t._count.tabla_afectada,
      })),
      usuarios_mas_activos: usuariosConConteo,
    };
  }

  async getActividadPorIP(ip_address: string, limit: number = 50) {
    const auditorias = await this.prisma.auditoria_sistema.findMany({
      where: { ip_address },
      orderBy: { fecha_hora: 'desc' },
      take: limit,
      include: {
        usuarios: {
          select: {
            id_usuario: true,
            username: true,
          },
        },
      },
    });

    const porAccion = {
      INSERT: auditorias.filter((a) => a.accion === 'INSERT').length,
      UPDATE: auditorias.filter((a) => a.accion === 'UPDATE').length,
      DELETE: auditorias.filter((a) => a.accion === 'DELETE').length,
    };

    return {
      ip_address,
      total_acciones: auditorias.length,
      acciones_por_tipo: porAccion,
      acciones_recientes: auditorias,
    };
  }

  async compareCambios(id_auditoria: number) {
    const auditoria = await this.findOne(id_auditoria);

    if (auditoria.accion === 'INSERT') {
      return {
        accion: 'INSERT',
        mensaje: 'Registro nuevo creado',
        valores_nuevos: auditoria.valores_nuevos,
      };
    }

    if (auditoria.accion === 'DELETE') {
      return {
        accion: 'DELETE',
        mensaje: 'Registro eliminado',
        valores_anteriores: auditoria.valores_anteriores,
      };
    }

    // Para UPDATE, comparar los cambios
    const valoresAnteriores = auditoria.valores_anteriores as any;
    const valoresNuevos = auditoria.valores_nuevos as any;

    if (!valoresAnteriores || !valoresNuevos) {
      return {
        accion: 'UPDATE',
        mensaje: 'No hay valores para comparar',
        cambios: [],
      };
    }

    const cambios: Array<{
      campo: string;
      valor_anterior: any;
      valor_nuevo: any;
    }> = [];

    const todasLasKeys = new Set([
      ...Object.keys(valoresAnteriores),
      ...Object.keys(valoresNuevos),
    ]);

    for (const key of todasLasKeys) {
      if (valoresAnteriores[key] !== valoresNuevos[key]) {
        cambios.push({
          campo: key,
          valor_anterior: valoresAnteriores[key],
          valor_nuevo: valoresNuevos[key],
        });
      }
    }

    return {
      accion: 'UPDATE',
      tabla: auditoria.tabla_afectada,
      id_registro: auditoria.id_registro,
      usuario: auditoria.usuarios.username,
      fecha_hora: auditoria.fecha_hora,
      total_campos_modificados: cambios.length,
      cambios,
    };
  }
}
