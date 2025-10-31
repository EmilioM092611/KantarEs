// FRONTEND/lib/api/usuarios.ts
// Servicio para gestión de usuarios

import { apiClient } from "./client";

// ==================== TIPOS E INTERFACES ====================

export interface Usuario {
  id_usuario: number;
  username: string;
  email: string;
  telefono: string | null; // ✅ Teléfono está en usuarios, no en personas
  activo: boolean;
  intentos_fallidos: number;
  bloqueado_hasta: string | null;
  ultimo_acceso: string | null;
  created_at: string;
  updated_at: string;
  id_persona: number;
  id_rol: number;
  personas: {
    id_persona: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    id_genero: number;
    fecha_nacimiento: string | null;
    // ❌ telefono NO existe en personas - está en usuarios
  };
  roles: {
    id_rol: number;
    nombre: string;
    descripcion: string | null;
    permisos: Record<string, boolean | string> | null; // ✅ AGREGADO - Campo JSON de permisos
  };
}

// Tipo adaptado para el frontend (lo que espera tu componente)
export interface UsuarioFrontend {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: "Activo" | "Inactivo" | "Suspendido";
  lastLogin: string;
  joinDate: string;
  birthDate?: string;
  permissions: string[];
  avatar?: string;
  username: string;
}

export interface CreateUsuarioDto {
  // Datos de persona
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  fecha_nacimiento?: string; // Formato: YYYY-MM-DD

  // Datos de usuario
  username: string;
  email: string;
  password: string;
  id_rol: number; // ID del rol (1=Admin, 2=Gerente, 3=Mesero, etc.)
}

export interface UpdateUsuarioDto {
  // Datos de persona (opcionales)
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  telefono?: string;
  id_genero?: number;
  fecha_nacimiento?: string; // Formato: YYYY-MM-DD

  // Datos de usuario (opcionales)
  username?: string;
  email?: string;
  id_rol?: number;
  activo?: boolean;
}

export interface CambiarPasswordDto {
  password_actual: string;
  password_nueva: string;
  confirmar_password: string;
}

// ==================== MAPEO DE PERMISOS ====================

/**
 * Mapeo de permisos del backend al frontend
 * Estos son los nombres que el frontend usa vs los que usa el backend
 */
const MAPEO_PERMISOS_BACKEND_A_FRONTEND: Record<string, string> = {
  // Backend -> Frontend
  ordenes: "ventas",
  mesas: "mesas",
  productos: "inventario",
  reportes: "reportes",
  usuarios: "usuarios",
  configuracion: "configuracion",
  pagos: "finanzas",
  cortes: "finanzas",
  all: "all", // Caso especial para administrador
};

/**
 * Todos los módulos disponibles en el sistema (para administrador)
 */
const TODOS_LOS_MODULOS = [
  "ventas",
  "mesas",
  "inventario",
  "reportes",
  "usuarios",
  "configuracion",
  "finanzas",
  "cocina",
  "bar",
];

/**
 * Convierte los permisos JSON del backend a un array de permisos del frontend
 * @param permisosJson - Objeto JSON con los permisos del rol desde el backend
 * @returns Array de strings con los IDs de permisos para el frontend
 */
function convertirPermisosJsonAArray(
  permisosJson: Record<string, boolean | string> | null
): string[] {
  if (!permisosJson) {
    return [];
  }

  // Caso especial: Si tiene "all": true, devolver todos los módulos
  if (permisosJson.all === true) {
    return TODOS_LOS_MODULOS;
  }

  const permisos: string[] = [];

  // Convertir cada clave del JSON a su equivalente en el frontend
  Object.entries(permisosJson).forEach(([key, value]) => {
    // Solo agregar si el valor es true o "view" o cualquier string
    if (value === true || typeof value === "string") {
      // Mapear el nombre del backend al frontend
      const permisoFrontend = MAPEO_PERMISOS_BACKEND_A_FRONTEND[key];

      if (permisoFrontend) {
        // Evitar duplicados
        if (!permisos.includes(permisoFrontend)) {
          permisos.push(permisoFrontend);
        }
      } else {
        // Si no hay mapeo, usar el nombre tal cual
        // Esto permite flexibilidad para nuevos permisos
        if (!permisos.includes(key)) {
          permisos.push(key);
        }
      }

      // Casos especiales para módulos específicos
      if (key === "ordenes") {
        // Si tiene acceso a órdenes, agregar los módulos de cocina y bar
        if (value === "view" || value === true) {
          if (!permisos.includes("cocina")) permisos.push("cocina");
          if (!permisos.includes("bar")) permisos.push("bar");
        }
      }
    }
  });

  return permisos;
}

// ==================== FUNCIONES DE TRANSFORMACIÓN ====================

/**
 * Convierte un usuario del backend al formato del frontend
 */
export function transformarUsuario(usuario: Usuario): UsuarioFrontend {
  const nombreCompleto = `${usuario.personas.nombre} ${
    usuario.personas.apellido_paterno
  }${
    usuario.personas.apellido_materno
      ? ` ${usuario.personas.apellido_materno}`
      : ""
  }`;

  // Determinar el estado
  let status: "Activo" | "Inactivo" | "Suspendido" = "Inactivo";
  if (usuario.activo) {
    status = "Activo";
  } else if (usuario.bloqueado_hasta) {
    status = "Suspendido";
  }

  // Formatear la fecha del último acceso
  const lastLogin = usuario.ultimo_acceso
    ? formatearFecha(new Date(usuario.ultimo_acceso))
    : "Nunca";

  // Formatear la fecha de creación
  const joinDate = formatearFecha(new Date(usuario.created_at));

  // ✅ OBTENER PERMISOS DESDE EL JSON DEL ROL
  const permissions = convertirPermisosJsonAArray(usuario.roles.permisos);

  return {
    id: usuario.id_usuario,
    name: nombreCompleto,
    email: usuario.email,
    phone: usuario.telefono || undefined, // ✅ Teléfono viene de usuarios, no de personas
    role: usuario.roles.nombre,
    status,
    lastLogin,
    joinDate,
    birthDate: usuario.personas.fecha_nacimiento || undefined,
    permissions, // ✅ PERMISOS DESDE EL JSON DEL ROL
    avatar: undefined,
    username: usuario.username,
  };
}

/**
 * Formatea una fecha de forma legible
 */
function formatearFecha(fecha: Date): string {
  const ahora = new Date();
  const diffMs = ahora.getTime() - fecha.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Si fue hoy
  if (diffDays === 0) {
    if (diffMins < 60) {
      return `Hace ${diffMins} minuto${diffMins !== 1 ? "s" : ""}`;
    }
    return `Hoy, ${fecha.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Si fue ayer
  if (diffDays === 1) {
    return `Ayer, ${fecha.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Si fue hace menos de una semana
  if (diffDays < 7) {
    return `Hace ${diffDays} día${diffDays !== 1 ? "s" : ""}`;
  }

  // Fecha completa
  return fecha.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ==================== SERVICIO DE USUARIOS ====================

class UsuariosService {
  private readonly endpoint = "/usuarios";

  /**
   * Obtener todos los usuarios
   */
  async obtenerUsuarios(filtros?: {
    rol?: string;
    activo?: boolean;
  }): Promise<UsuarioFrontend[]> {
    try {
      const response = await apiClient.get<Usuario[]>(this.endpoint, filtros);
      return response.map(transformarUsuario);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  }

  /**
   * Obtener un usuario por ID
   */
  async obtenerUsuario(id: number): Promise<UsuarioFrontend> {
    try {
      const response = await apiClient.get<Usuario>(`${this.endpoint}/${id}`);
      return transformarUsuario(response);
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear un nuevo usuario
   */
  async crearUsuario(data: CreateUsuarioDto): Promise<UsuarioFrontend> {
    try {
      const response = await apiClient.post<Usuario>(this.endpoint, data);
      return transformarUsuario(response);
    } catch (error: any) {
      console.error("Error al crear usuario:", error);

      // Mensajes de error más específicos
      if (error.message.includes("409")) {
        throw new Error("El email o username ya está en uso");
      } else if (error.message.includes("400")) {
        throw new Error("Datos inválidos. Verifica todos los campos");
      }

      throw error;
    }
  }

  /**
   * Actualizar un usuario existente
   */
  async actualizarUsuario(
    id: number,
    data: UpdateUsuarioDto
  ): Promise<UsuarioFrontend> {
    try {
      const response = await apiClient.patch<Usuario>(
        `${this.endpoint}/${id}`,
        data
      );
      return transformarUsuario(response);
    } catch (error: any) {
      console.error(`Error al actualizar usuario ${id}:`, error);

      if (error.message.includes("404")) {
        throw new Error("Usuario no encontrado");
      } else if (error.message.includes("409")) {
        throw new Error("El email o username ya está en uso");
      }

      throw error;
    }
  }

  /**
   * Desactivar un usuario (soft delete)
   */
  async desactivarUsuario(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error al desactivar usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activar un usuario (restaura usuarios eliminados con soft delete)
   */
  async activarUsuario(id: number): Promise<UsuarioFrontend> {
    try {
      // ✅ Cambio a POST /usuarios/:id/activar para manejar soft delete
      const response = await apiClient.post<{
        message: string;
        usuario: Usuario;
      }>(`${this.endpoint}/${id}/activar`);
      return transformarUsuario(response.usuario);
    } catch (error: any) {
      console.error(`Error al activar usuario ${id}:`, error);

      if (error.message.includes("409")) {
        throw new Error("El usuario ya está activo");
      } else if (error.message.includes("404")) {
        throw new Error("Usuario no encontrado");
      }

      throw error;
    }
  }

  /**
   * Cambiar contraseña de un usuario
   */
  async cambiarPassword(id: number, data: CambiarPasswordDto): Promise<void> {
    try {
      await apiClient.post(`${this.endpoint}/${id}/cambiar-password`, data);
    } catch (error: any) {
      console.error(`Error al cambiar contraseña del usuario ${id}:`, error);

      if (error.message.includes("401")) {
        throw new Error("Contraseña actual incorrecta");
      } else if (error.message.includes("400")) {
        throw new Error(
          "Las contraseñas no coinciden o no cumplen los requisitos"
        );
      }

      throw error;
    }
  }

  /**
   * Resetear contraseña de un usuario (solo admin)
   */
  async resetearPassword(id: number): Promise<{ nuevaPassword: string }> {
    try {
      const response = await apiClient.post<{ nuevaPassword: string }>(
        `${this.endpoint}/${id}/reset-password`
      );
      return response;
    } catch (error) {
      console.error(`Error al resetear contraseña del usuario ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async obtenerEstadisticas(): Promise<{
    total: number;
    activos: number;
    inactivos: number;
    suspendidos: number;
    porRol: Record<string, number>;
  }> {
    try {
      const usuarios = await this.obtenerUsuarios();

      const stats = {
        total: usuarios.length,
        activos: usuarios.filter((u) => u.status === "Activo").length,
        inactivos: usuarios.filter((u) => u.status === "Inactivo").length,
        suspendidos: usuarios.filter((u) => u.status === "Suspendido").length,
        porRol: {} as Record<string, number>,
      };

      // Contar por rol
      usuarios.forEach((usuario) => {
        stats.porRol[usuario.role] = (stats.porRol[usuario.role] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("Error al obtener estadísticas de usuarios:", error);
      throw error;
    }
  }
}

// Exportar instancia única del servicio
export const usuariosService = new UsuariosService();
