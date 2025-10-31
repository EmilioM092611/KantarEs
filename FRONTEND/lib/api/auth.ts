// FRONTEND/lib/api/auth.ts
// Servicio para manejo de autenticación

import { apiClient } from "./client";

// Tipos de datos
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    username: string;
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
  };
}

export interface User {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );

    // Guardar token y usuario en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    return response;
  },

  /**
   * Obtener usuario actual
   */
  async me(): Promise<User> {
    return apiClient.get<User>("/auth/me");
  },

  /**
   * Cerrar sesión
   */
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  },

  /**
   * Verificar si hay sesión activa
   */
  isAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("access_token");
    }
    return false;
  },

  /**
   * Obtener usuario desde localStorage
   */
  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },
};
