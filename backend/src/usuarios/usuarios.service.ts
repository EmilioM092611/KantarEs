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
        id_genero: 1, // Por defecto
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
        pin_rapido: createUsuarioDto.pin_rapido,
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
        personas: {
          select: {
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
          },
        },
        roles: {
          select: {
            nombre: true,
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
    if (updateUsuarioDto.pin_rapido)
      updateData.pin_rapido = updateUsuarioDto.pin_rapido;

    // Si hay una nueva contraseña, hashearla
    if (updateUsuarioDto.password) {
      updateData.password_hash = await bcrypt.hash(
        updateUsuarioDto.password,
        10,
      );
    }

    // Actualizar datos de persona si se proporcionan
    if (
      updateUsuarioDto.nombre ||
      updateUsuarioDto.apellido_paterno ||
      updateUsuarioDto.apellido_materno
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
        },
      });
    }

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

    // Soft delete
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
