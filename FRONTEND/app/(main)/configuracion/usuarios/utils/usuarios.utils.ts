import type { UsuarioFrontend } from "@/lib/api/usuarios";

/**
 * ============================================
 * FUNCIONES DE CÁLCULO DE ESTADÍSTICAS
 * ============================================
 */

/**
 * Calcula las estadísticas generales de usuarios
 */
export function calculateUserStats(usuarios: UsuarioFrontend[]) {
  const total = usuarios.length;
  const activos = usuarios.filter((u) => u.status === "Activo").length;
  const suspendidos = usuarios.filter((u) => u.status === "Suspendido").length;
  const rolesUnicos = new Set(usuarios.map((u) => u.role)).size;

  return {
    total,
    activos,
    suspendidos,
    rolesUnicos,
    porcentajeActivos: total > 0 ? Math.round((activos / total) * 100) : 0,
  };
}

/**
 * ============================================
 * FUNCIONES DE FILTRADO
 * ============================================
 */

/**
 * Filtra usuarios según término de búsqueda, rol y estado
 */
export function filterUsers(
  usuarios: UsuarioFrontend[],
  searchTerm: string,
  roleFilter: string,
  statusFilter: string
) {
  return usuarios.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      roleFilter === "all" ||
      user.role.toLowerCase() === roleFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });
}

/**
 * ============================================
 * FUNCIONES DE PAGINACIÓN
 * ============================================
 */

/**
 * Pagina una lista de usuarios
 */
export function paginateUsers(
  usuarios: UsuarioFrontend[],
  currentPage: number,
  itemsPerPage: number
) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return usuarios.slice(startIndex, endIndex);
}

/**
 * ============================================
 * FUNCIONES DE GENERACIÓN DE USERNAME
 * ============================================
 */

/**
 * Genera un username a partir del email
 */
export function generateUsernameFromEmail(email: string): string {
  if (!email) return "";

  return email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_.-]/g, "")
    .toLowerCase();
}

/**
 * ============================================
 * FUNCIONES DE UI - INICIALES Y COLORES
 * ============================================
 */

/**
 * Obtiene las iniciales de un nombre completo
 * @param name - Nombre completo del usuario
 * @returns Iniciales (máximo 2 letras)
 */
export function getUserInitials(name: string): string {
  if (!name) return "";

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Obtiene el color CSS para un estado de usuario
 * @param status - Estado del usuario (Activo, Inactivo, Suspendido)
 * @returns Clases CSS de Tailwind para el badge
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Activo: "bg-green-100 text-green-800 border-green-300",
    Inactivo: "bg-gray-100 text-gray-800 border-gray-300",
    Suspendido: "bg-red-100 text-red-800 border-red-300",
  };

  return colors[status] || colors.Inactivo;
}

/**
 * Obtiene el color CSS para un rol de usuario
 * @param role - Rol del usuario
 * @returns Clases CSS de Tailwind para el badge
 */
export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    administrador: "bg-purple-100 text-purple-800 border-purple-300",
    Administrador: "bg-purple-100 text-purple-800 border-purple-300",
    gerente: "bg-blue-100 text-blue-800 border-blue-300",
    Gerente: "bg-blue-100 text-blue-800 border-blue-300",
    mesero: "bg-orange-100 text-orange-800 border-orange-300",
    Mesero: "bg-orange-100 text-orange-800 border-orange-300",
    cocinero: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Cocinero: "bg-yellow-100 text-yellow-800 border-yellow-300",
    cajero: "bg-green-100 text-green-800 border-green-300",
    Cajero: "bg-green-100 text-green-800 border-green-300",
    bartender: "bg-pink-100 text-pink-800 border-pink-300",
    Bartender: "bg-pink-100 text-pink-800 border-pink-300",
  };

  return colors[role] || "bg-gray-100 text-gray-800 border-gray-300";
}

/**
 * ============================================
 * FUNCIONES DE VALIDACIÓN
 * ============================================
 */

/**
 * Valida si un email tiene formato válido
 * @param email - Email a validar
 * @returns true si el email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida si una contraseña cumple con los requisitos mínimos
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Valida si las contraseñas coinciden
 */
export function passwordsMatch(
  password: string,
  confirmPassword: string
): boolean {
  return password === confirmPassword;
}

/**
 * ============================================
 * FUNCIONES DE FORMATEO
 * ============================================
 */

/**
 * Formatea un número de teléfono
 * @param phone - Número de teléfono
 * @returns Teléfono formateado
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";

  // Elimina caracteres no numéricos
  const cleaned = phone.replace(/\D/g, "");

  // Formatea según longitud
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

/**
 * Obtiene el nombre del rol traducido
 * @param role - Rol en inglés o español
 * @returns Nombre del rol en español capitalizado
 */
export function getRoleName(role: string): string {
  const roleNames: Record<string, string> = {
    administrador: "Administrador",
    gerente: "Gerente",
    mesero: "Mesero",
    cocinero: "Cocinero",
    cajero: "Cajero",
    bartender: "Bartender",
  };

  return roleNames[role.toLowerCase()] || role;
}

/**
 * ============================================
 * FUNCIONES DE PERMISOS
 * ============================================
 */

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function hasPermission(
  user: UsuarioFrontend,
  permission: string
): boolean {
  if (!user.permissions) return false;
  if (user.role.toLowerCase() === "administrador") return true;
  return user.permissions.includes(permission);
}

/**
 * Obtiene todos los permisos de un rol
 */
export function getPermissionsByRole(role: string): string[] {
  const permissionMap: Record<string, string[]> = {
    administrador: ["all"],
    gerente: ["ventas", "inventario", "reportes", "usuarios"],
    mesero: ["ventas", "mesas"],
    cocinero: ["cocina", "inventario"],
    cajero: ["ventas", "cortes"],
    bartender: ["bar", "inventario"],
  };

  return permissionMap[role.toLowerCase()] || [];
}
