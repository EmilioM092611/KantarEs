// FRONTEND/lib/auth.ts
// Funciones utilitarias para manejo de autenticación

"use client";

export const AUTH_KEY = "kantares_auth";
export const USER_KEY = "user"; // Cambiado a "user" para consistencia
export const TOKEN_KEY = "token";
export const ACCESS_TOKEN_KEY = "access_token";

export interface AuthData {
  username: string;
  name: string;
  role: string;
  token?: string;
  email?: string;
  id?: number;
}

// ===== FUNCIONES DE ALMACENAMIENTO =====

/**
 * Guardar datos de autenticación
 */
export function setAuth(data: AuthData) {
  if (typeof window === "undefined") return;

  // Guardar en localStorage
  localStorage.setItem("auth", JSON.stringify(data));

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("access_token", data.token); // Para compatibilidad con API client
  }

  // También guardar en cookies si usas middleware
  if (data.token) {
    document.cookie = `token=${data.token}; path=/; max-age=86400`; // 24 horas
  }
}

/**
 * Limpiar todos los datos de autenticación
 */
export function clearAuth() {
  if (typeof window === "undefined") return;

  // Limpiar localStorage
  localStorage.removeItem("auth");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");

  // Limpiar cookies
  document.cookie = "token=; path=/; max-age=0";
}

/**
 * Obtener datos de autenticación completos
 */
export function getAuth(): AuthData | null {
  if (typeof window === "undefined") return null;

  const auth = localStorage.getItem("auth");
  return auth ? JSON.parse(auth) : null;
}

/**
 * Obtener solo el token
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  // Intentar con ambas claves por compatibilidad
  return localStorage.getItem("access_token") || localStorage.getItem("token");
}

/**
 * Obtener datos del usuario
 */
export function getUser() {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Verificar si hay una sesión activa
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const token = getToken();
  const user = getUser();

  return !!(token && user);
}

/**
 * Verificar si el usuario tiene un rol específico
 */
export function hasRole(role: string): boolean {
  const user = getUser();
  return user?.rol === role;
}

/**
 * Verificar si el usuario tiene uno de los roles permitidos
 */
export function hasAnyRole(roles: string[]): boolean {
  const user = getUser();
  return roles.some((role) => user?.rol === role);
}

/**
 * Obtener el nombre completo del usuario
 */
export function getUserName(): string {
  const user = getUser();
  return user?.nombre || "Usuario";
}

/**
 * Obtener el rol del usuario
 */
export function getUserRole(): string {
  const user = getUser();
  return user?.rol || "";
}

// ===== FUNCIONES DE VALIDACIÓN =====

/**
 * Verificar si el token está expirado (básico)
 * Nota: Para una validación completa deberías decodificar el JWT
 */
export function isTokenExpired(): boolean {
  // Implementación básica - puedes mejorarla decodificando el JWT
  const token = getToken();
  return !token;
}

/**
 * Decodificar JWT (básico)
 * Nota: Solo decodifica, no valida la firma
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decodificando token:", error);
    return null;
  }
}

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Refrescar la página de forma segura
 */
export function refreshPage() {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

/**
 * Redirigir a una ruta
 */
export function redirectTo(path: string) {
  if (typeof window !== "undefined") {
    window.location.href = path;
  }
}
