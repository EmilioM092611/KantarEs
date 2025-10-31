/**
 * Constantes y configuraciones para el módulo de usuarios
 */

/**
 * Lista de permisos disponibles en el sistema
 */
export const permissions = [
  {
    id: "ventas",
    label: "Gestión de Ventas",
    description: "Crear y gestionar órdenes",
  },
  {
    id: "mesas",
    label: "Gestión de Mesas",
    description: "Abrir, cerrar y gestionar mesas",
  },
  {
    id: "inventario",
    label: "Inventario",
    description: "Gestionar productos e inventario",
  },
  {
    id: "reportes",
    label: "Reportes",
    description: "Ver y generar reportes",
  },
  {
    id: "usuarios",
    label: "Usuarios",
    description: "Gestionar usuarios del sistema",
  },
  {
    id: "configuracion",
    label: "Configuración",
    description: "Configurar el sistema",
  },
  {
    id: "finanzas",
    label: "Finanzas",
    description: "Gestionar finanzas y cortes",
  },
  {
    id: "cocina",
    label: "Cocina",
    description: "Gestionar órdenes de cocina",
  },
  {
    id: "bar",
    label: "Bar",
    description: "Gestionar órdenes de bar",
  },
] as const;

/**
 * Lista de roles disponibles en el sistema
 */
export const roles = [
  {
    value: "administrador",
    label: "Administrador",
    permissions: ["all"],
    description: "Acceso total al sistema",
  },
  {
    value: "gerente",
    label: "Gerente",
    permissions: ["ventas", "inventario", "reportes", "usuarios"],
    description: "Gestión general del restaurante",
  },
  {
    value: "mesero",
    label: "Mesero",
    permissions: ["ventas", "mesas"],
    description: "Atención de mesas y pedidos",
  },
  {
    value: "cocinero",
    label: "Cocinero",
    permissions: ["cocina", "inventario"],
    description: "Preparación de alimentos",
  },
  {
    value: "cajero",
    label: "Cajero",
    permissions: ["ventas", "cortes"],
    description: "Gestión de pagos",
  },
  {
    value: "bartender",
    label: "Bartender",
    permissions: ["bar", "inventario"],
    description: "Preparación de bebidas",
  },
] as const;

/**
 * Estados posibles de un usuario
 */
export const USER_STATUSES = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
} as const;

/**
 * Colores para los estados de usuario
 */
export const COLORES_ESTADO = {
  Activo: "bg-green-100 text-green-800 border-green-300",
  Inactivo: "bg-gray-100 text-gray-800 border-gray-300",
  Suspendido: "bg-red-100 text-red-800 border-red-300",
} as const;

/**
 * Colores para los roles de usuario
 */
export const COLORES_ROL = {
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
} as const;

/**
 * Configuración de paginación
 */
export const ITEMS_PER_PAGE = 10;

/**
 * Requisitos mínimos para contraseñas
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true,
} as const;
