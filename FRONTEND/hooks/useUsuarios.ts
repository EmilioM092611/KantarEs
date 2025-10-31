// FRONTEND/hooks/useUsuarios.ts
// Hook para gestión de usuarios

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  usuariosService,
  type UsuarioFrontend,
  type CreateUsuarioDto,
  type UpdateUsuarioDto,
} from "@/lib/api/usuarios";
import { obtenerIdRol } from "@/lib/constants/usuarios";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioFrontend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios
  const cargarUsuarios = useCallback(
    async (filtros?: { rol?: string; activo?: boolean }) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await usuariosService.obtenerUsuarios(filtros);
        setUsuarios(data);
      } catch (err: any) {
        console.error("Error al cargar usuarios:", err);
        setError(err.message || "Error al cargar usuarios");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Crear usuario
  const crearUsuario = useCallback(
    async (datos: {
      name: string;
      email: string;
      phone?: string;
      role: string;
      password: string;
      username?: string;
      birthDate?: string; // ✅ AGREGADO - Fecha de nacimiento
    }) => {
      try {
        setError(null);

        // Dividir el nombre completo
        const nombreParts = datos.name.trim().split(" ");
        const nombre = nombreParts[0];
        const apellido_paterno = nombreParts[1] || "Sin Apellido";
        const apellido_materno =
          nombreParts.length > 2 ? nombreParts.slice(2).join(" ") : undefined;

        // Preparar DTO
        const dto: CreateUsuarioDto = {
          nombre,
          apellido_paterno,
          apellido_materno,
          telefono: datos.phone,
          fecha_nacimiento: datos.birthDate, // ✅ AGREGADO
          username: datos.username || datos.email.split("@")[0],
          email: datos.email,
          password: datos.password,
          id_rol: obtenerIdRol(datos.role),
        };

        const nuevoUsuario = await usuariosService.crearUsuario(dto);
        setUsuarios((prev) => [...prev, nuevoUsuario]);

        return nuevoUsuario;
      } catch (err: any) {
        console.error("Error al crear usuario:", err);
        setError(err.message || "Error al crear usuario");
        throw err;
      }
    },
    []
  );

  // Actualizar usuario
  const actualizarUsuario = useCallback(
    async (
      id: number,
      datos: {
        name?: string;
        email?: string;
        phone?: string;
        role?: string;
        username?: string; // ✅ AGREGADO
        birthDate?: string; // ✅ AGREGADO
      }
    ) => {
      try {
        setError(null);

        // ⚠️ VALIDACIÓN CRÍTICA: Asegurar que NO se envíen campos prohibidos
        // Filtrar explícitamente solo los campos permitidos
        const datosFiltrados = {
          name: datos.name,
          email: datos.email,
          phone: datos.phone,
          role: datos.role,
          username: datos.username,
          birthDate: datos.birthDate,
        };

        // Preparar DTO solo con los campos que están definidos
        const dto: UpdateUsuarioDto = {};

        if (datosFiltrados.name) {
          const nombreParts = datosFiltrados.name.trim().split(" ");
          dto.nombre = nombreParts[0];
          dto.apellido_paterno = nombreParts[1] || "Sin Apellido";
          dto.apellido_materno =
            nombreParts.length > 2 ? nombreParts.slice(2).join(" ") : undefined;
        }

        if (datosFiltrados.email) {
          dto.email = datosFiltrados.email;
        }

        if (datosFiltrados.username) {
          dto.username = datosFiltrados.username;
        }

        if (datosFiltrados.phone) {
          dto.telefono = datosFiltrados.phone;
        }

        if (datosFiltrados.role) {
          dto.id_rol = obtenerIdRol(datosFiltrados.role);
        }

        // ✅ AGREGADO - Fecha de nacimiento
        if (datosFiltrados.birthDate) {
          dto.fecha_nacimiento = datosFiltrados.birthDate;
        }

        // 🔒 LOG DE SEGURIDAD: Verificar que no se envíe password
        console.log("📤 Actualizando usuario - DTO enviado:", dto);
        if ("password" in dto || "password_hash" in dto) {
          console.error(
            "⛔ ALERTA: Se intentó enviar password en actualización"
          );
          throw new Error(
            "Error de seguridad: no se puede actualizar password por este método"
          );
        }

        const usuarioActualizado = await usuariosService.actualizarUsuario(
          id,
          dto
        );

        setUsuarios((prev) =>
          prev.map((u) => (u.id === id ? usuarioActualizado : u))
        );

        return usuarioActualizado;
      } catch (err: any) {
        console.error("Error al actualizar usuario:", err);
        setError(err.message || "Error al actualizar usuario");
        throw err;
      }
    },
    []
  );

  // Desactivar usuario
  const desactivarUsuario = useCallback(async (id: number) => {
    try {
      setError(null);
      await usuariosService.desactivarUsuario(id);

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: "Inactivo" as const } : u
        )
      );
    } catch (err: any) {
      console.error("Error al desactivar usuario:", err);
      setError(err.message || "Error al desactivar usuario");
      throw err;
    }
  }, []);

  // Activar usuario
  const activarUsuario = useCallback(async (id: number) => {
    try {
      setError(null);
      const usuarioActualizado = await usuariosService.activarUsuario(id);

      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? usuarioActualizado : u))
      );
    } catch (err: any) {
      console.error("Error al activar usuario:", err);
      setError(err.message || "Error al activar usuario");
      throw err;
    }
  }, []);

  // Cambiar contraseña
  const cambiarPassword = useCallback(
    async (
      id: number,
      passwordActual: string,
      passwordNueva: string,
      confirmarPassword: string
    ) => {
      try {
        setError(null);
        await usuariosService.cambiarPassword(id, {
          password_actual: passwordActual,
          password_nueva: passwordNueva,
          confirmar_password: confirmarPassword,
        });
      } catch (err: any) {
        console.error("Error al cambiar contraseña:", err);
        setError(err.message || "Error al cambiar contraseña");
        throw err;
      }
    },
    []
  );

  // Cargar al montar
  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  return {
    usuarios,
    isLoading,
    error,
    cargarUsuarios,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario,
    activarUsuario,
    cambiarPassword,
  };
}

// Hook para obtener un solo usuario
export function useUsuario(id: number) {
  const [usuario, setUsuario] = useState<UsuarioFrontend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await usuariosService.obtenerUsuario(id);
        setUsuario(data);
      } catch (err: any) {
        console.error(`Error al cargar usuario ${id}:`, err);
        setError(err.message || "Error al cargar usuario");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      cargarUsuario();
    }
  }, [id]);

  return { usuario, isLoading, error };
}

// Hook para estadísticas de usuarios
export function useEstadisticasUsuarios() {
  const [stats, setStats] = useState<{
    total: number;
    activos: number;
    inactivos: number;
    suspendidos: number;
    porRol: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await usuariosService.obtenerEstadisticas();
        setStats(data);
      } catch (err: any) {
        console.error("Error al cargar estadísticas:", err);
        setError(err.message || "Error al cargar estadísticas");
      } finally {
        setIsLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  return { stats, isLoading, error };
}
