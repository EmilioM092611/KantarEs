/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.usuarios.findFirst({
      where: {
        OR: [
          { username: createUsuarioDto.username },
          { email: createUsuarioDto.email },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('El username o email ya existe');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    // Crear primero la persona
    const persona = await this.prisma.personas.create({
      data: {
        nombre: createUsuarioDto.nombre,
        apellido_paterno: createUsuarioDto.apellido_paterno,
        apellido_materno: createUsuarioDto.apellido_materno,
        fecha_nacimiento: createUsuarioDto.fecha_nacimiento
          ? new Date(createUsuarioDto.fecha_nacimiento)
          : null,
        id_genero: createUsuarioDto.id_genero || 1,
      },
    });

    // Crear el usuario
    const usuario = await this.prisma.usuarios.create({
      data: {
        username: createUsuarioDto.username,
        password_hash: hashedPassword,
        email: createUsuarioDto.email,
        telefono: createUsuarioDto.telefono,
        id_persona: persona.id_persona,
        id_rol: createUsuarioDto.id_rol,
        activo: true,
      },
      include: {
        personas: true,
        roles: true,
      },
    });

    // Quitar el password del resultado
    const { password_hash, ...result } = usuario;
    return result;
  }

  async findAll() {
    return this.prisma.usuarios.findMany({
      where: { deleted_at: null },
      select: {
        id_usuario: true,
        username: true,
        email: true,
        telefono: true,
        activo: true,
        ultimo_acceso: true,
        created_at: true,
        updated_at: true,
        intentos_fallidos: true,
        bloqueado_hasta: true,
        id_persona: true,
        id_rol: true,
        personas: {
          select: {
            id_persona: true,
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            id_genero: true,
            fecha_nacimiento: true,
          },
        },
        roles: {
          select: {
            id_rol: true,
            nombre: true,
            descripcion: true,
            permisos: true,
            nivel_acceso: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuarios.findFirst({
      where: {
        id_usuario: id,
        deleted_at: null,
      },
      include: {
        personas: true,
        roles: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }

    const { password_hash, ...result } = usuario;
    return result;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    // Verificar si el usuario existe
    const usuario = await this.prisma.usuarios.findFirst({
      where: {
        id_usuario: id,
        deleted_at: null,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }

    // 🔍 LOG DE DEBUG - Ver qué datos llegan
    console.log('🔍 UPDATE USUARIO - DTO recibido:', updateUsuarioDto);
    console.log(
      '🔍 UPDATE USUARIO - Campos del DTO:',
      Object.keys(updateUsuarioDto),
    );

    // Preparar datos de actualización
    const updateData: any = {};

    // Si se está actualizando username o email, verificar que no existan
    if (updateUsuarioDto.username || updateUsuarioDto.email) {
      const existing = await this.prisma.usuarios.findFirst({
        where: {
          AND: [
            { id_usuario: { not: id } },
            {
              OR: [
                updateUsuarioDto.username
                  ? { username: updateUsuarioDto.username }
                  : {},
                updateUsuarioDto.email ? { email: updateUsuarioDto.email } : {},
              ],
            },
          ],
        },
      });

      if (existing) {
        throw new ConflictException('El username o email ya está en uso');
      }
    }

    // Actualizar campos del usuario
    if (updateUsuarioDto.username)
      updateData.username = updateUsuarioDto.username;
    if (updateUsuarioDto.email) updateData.email = updateUsuarioDto.email;
    if (updateUsuarioDto.telefono !== undefined)
      updateData.telefono = updateUsuarioDto.telefono;
    if (updateUsuarioDto.id_rol) updateData.id_rol = updateUsuarioDto.id_rol;
    if (updateUsuarioDto.activo !== undefined)
      updateData.activo = updateUsuarioDto.activo;

    // Actualizar datos de persona si se proporcionan
    if (
      updateUsuarioDto.nombre ||
      updateUsuarioDto.apellido_paterno ||
      updateUsuarioDto.apellido_materno ||
      updateUsuarioDto.fecha_nacimiento ||
      updateUsuarioDto.id_genero
    ) {
      await this.prisma.personas.update({
        where: { id_persona: usuario.id_persona },
        data: {
          ...(updateUsuarioDto.nombre && { nombre: updateUsuarioDto.nombre }),
          ...(updateUsuarioDto.apellido_paterno && {
            apellido_paterno: updateUsuarioDto.apellido_paterno,
          }),
          ...(updateUsuarioDto.apellido_materno && {
            apellido_materno: updateUsuarioDto.apellido_materno,
          }),
          ...(updateUsuarioDto.fecha_nacimiento && {
            fecha_nacimiento: new Date(updateUsuarioDto.fecha_nacimiento),
          }),
          ...(updateUsuarioDto.id_genero && {
            id_genero: updateUsuarioDto.id_genero,
          }),
        },
      });
    }

    // 🔍 LOG DE DEBUG - Ver qué se va a actualizar
    console.log('🔍 UPDATE USUARIO - Datos a actualizar:', updateData);

    // Actualizar usuario
    const updatedUser = await this.prisma.usuarios.update({
      where: { id_usuario: id },
      data: updateData,
      include: {
        personas: true,
        roles: true,
      },
    });

    const { password_hash, ...result } = updatedUser;
    return result;
  }

  // ✅ NUEVO MÉTODO: Activar usuario eliminado (soft delete)
  async activate(id: number) {
    // Buscar el usuario SIN filtrar por deleted_at
    const usuario = await this.prisma.usuarios.findUnique({
      where: {
        id_usuario: id,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }

    // Si el usuario ya está activo, no hacer nada
    if (usuario.activo && !usuario.deleted_at) {
      throw new ConflictException(
        `El usuario ${usuario.username} ya está activo`,
      );
    }

    // Activar el usuario y restaurar del soft delete
    const activatedUser = await this.prisma.usuarios.update({
      where: { id_usuario: id },
      data: {
        activo: true,
        deleted_at: null, // ✅ Restaurar del soft delete
        bloqueado_hasta: null, // ✅ Quitar bloqueo si lo tiene
        intentos_fallidos: 0, // ✅ Resetear intentos fallidos
      },
      include: {
        personas: true,
        roles: true,
      },
    });

    const { password_hash, ...result } = activatedUser;
    return {
      message: `Usuario ${activatedUser.username} activado correctamente`,
      usuario: result,
    };
  }

  async remove(id: number) {
    // Verificar si el usuario existe
    const usuario = await this.prisma.usuarios.findFirst({
      where: {
        id_usuario: id,
        deleted_at: null,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }

    // No permitir eliminar el último administrador activo
    if (usuario.id_rol === 1) {
      const adminCount = await this.prisma.usuarios.count({
        where: {
          id_rol: 1,
          activo: true,
          deleted_at: null,
          id_usuario: { not: id },
        },
      });

      if (adminCount === 0) {
        throw new ConflictException(
          'No se puede eliminar el último administrador del sistema',
        );
      }
    }

    const deletedUser = await this.prisma.usuarios.update({
      where: { id_usuario: id },
      data: {
        deleted_at: new Date(),
        activo: false,
      },
      include: {
        personas: true,
        roles: true,
      },
    });

    const { password_hash, ...result } = deletedUser;
    return {
      message: `Usuario ${deletedUser.username} eliminado correctamente`,
      usuario: result,
    };
  }
}
