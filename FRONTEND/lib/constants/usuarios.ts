// FRONTEND/lib/constants/usuarios.ts
// Constantes para el módulo de usuarios

/**
 * IDs de roles según la base de datos
 */
export const ROLES = {
  ADMINISTRADOR: 1,
  GERENTE: 2,
  CAJERO: 3,
  MESERO: 4,
  COCINERO: 5,
  BARTENDER: 6,
} as const;

/**
 * Nombres de roles para display
 */
export const ROLES_NOMBRES = {
  [ROLES.ADMINISTRADOR]: "Administrador",
  [ROLES.GERENTE]: "Gerente",
  [ROLES.CAJERO]: "Cajero",
  [ROLES.MESERO]: "Mesero",
  [ROLES.COCINERO]: "Cocinero",
  [ROLES.BARTENDER]: "Bartender",
} as const;

/**
 * IDs de géneros según la base de datos
 */
export const GENEROS = {
  MASCULINO: 1,
  FEMENINO: 2,
  OTRO: 3,
} as const;

/**
 * Nombres de géneros para display
 */
export const GENEROS_NOMBRES = {
  [GENEROS.MASCULINO]: "Masculino",
  [GENEROS.FEMENINO]: "Femenino",
  [GENEROS.OTRO]: "Otro",
} as const;

/**
 * Mapeo de roles del frontend a IDs del backend
 */
export function obtenerIdRol(nombreRol: string): number {
  const rolNormalizado = nombreRol.toLowerCase();

  switch (rolNormalizado) {
    case "administrador":
      return ROLES.ADMINISTRADOR;
    case "gerente":
      return ROLES.GERENTE;
    case "cajero":
      return ROLES.CAJERO;
    case "mesero":
      return ROLES.MESERO;
    case "cocinero":
      return ROLES.COCINERO;
    case "bartender":
    case "barista":
      return ROLES.BARTENDER;
    default:
      return ROLES.MESERO; // Default
  }
}

/**
 * Obtener nombre del rol por ID
 */
export function obtenerNombreRol(idRol: number): string {
  return ROLES_NOMBRES[idRol as keyof typeof ROLES_NOMBRES] || "Desconocido";
}

/**
 * Obtener nombre del género por ID
 */
export function obtenerNombreGenero(idGenero: number): string {
  return GENEROS_NOMBRES[idGenero as keyof typeof GENEROS_NOMBRES] || "Otro";
}

/**
 * Colores para los badges de estado
 */
export const COLORES_ESTADO = {
  Activo: "bg-green-100 text-green-800 border-green-300",
  Inactivo: "bg-gray-100 text-gray-800 border-gray-300",
  Suspendido: "bg-red-100 text-red-800 border-red-300",
} as const;

/**
 * Colores para los badges de roles
 */
export const COLORES_ROL = {
  Administrador: "bg-purple-100 text-purple-800 border-purple-300",
  Gerente: "bg-blue-100 text-blue-800 border-blue-300",
  Cajero: "bg-green-100 text-green-800 border-green-300",
  Mesero: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Cocinero: "bg-orange-100 text-orange-800 border-orange-300",
  Bartender: "bg-pink-100 text-pink-800 border-pink-300",
} as const;
