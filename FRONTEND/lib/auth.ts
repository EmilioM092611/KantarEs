"use client";

export const AUTH_KEY = "kantares_auth";
export const USER_KEY = "kantares_user";
export interface AuthData {
  username: string;
  name: string;
  role: string;
  token?: string;
  email?: string;
  id?: number;
}

// lib/auth.ts
export function setAuth(data: AuthData) {
  // Guardar en localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("auth", JSON.stringify(data));
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    // También guardar en cookies si usas middleware
    document.cookie = `token=${data.token}; path=/`;
  }
}

export function clearAuth() {
  localStorage.removeItem("auth");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getAuth(): AuthData | null {
  const auth = localStorage.getItem("auth");
  return auth ? JSON.parse(auth) : null;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!getAuth();
}
