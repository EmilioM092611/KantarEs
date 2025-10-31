// FRONTEND/contexts/AuthContext.tsx
// VERSION CON LOGS DE DIAGNÓSTICO
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { FullScreenLoader } from "@/components/full-screen-loader";

export interface AuthData {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    nombre: string;
    rol: string;
  };
}

interface AuthContextType {
  auth: AuthData | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  login: (data: AuthData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 [AUTH-CONTEXT] Inicializando AuthProvider");
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      console.log("🔐 [AUTH-CONTEXT] Verificando localStorage:", {
        hasToken: !!token,
        hasUser: !!userStr,
      });

      if (token && userStr) {
        const user = JSON.parse(userStr);
        console.log(
          "✅ [AUTH-CONTEXT] Usuario encontrado en localStorage:",
          user.email
        );
        setAuth({ token, user });
      } else {
        console.log(
          "⚠️ [AUTH-CONTEXT] No hay datos de autenticación en localStorage"
        );
      }
    } catch (error) {
      console.error(
        "❌ [AUTH-CONTEXT] Error al cargar datos de autenticación:",
        error
      );
    } finally {
      console.log("✅ [AUTH-CONTEXT] Carga inicial completada");
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    (data: AuthData) => {
      console.log("🚀 [AUTH-CONTEXT] Iniciando proceso de login");
      console.log("👤 [AUTH-CONTEXT] Usuario:", data.user.email);

      setIsLoggingIn(true);
      setLoginSuccess(false);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      console.log("💾 [AUTH-CONTEXT] Datos guardados en localStorage");

      setAuth(data);
      console.log("✅ [AUTH-CONTEXT] Estado auth actualizado");

      setTimeout(() => {
        console.log(
          "✅ [AUTH-CONTEXT] Login exitoso - mostrando animación de éxito"
        );
        setLoginSuccess(true);
      }, 1500);

      setTimeout(() => {
        console.log("🎬 [AUTH-CONTEXT] Ocultando loader");
        setIsLoggingIn(false);
      }, 4000);

      setTimeout(() => {
        console.log("🚀 [AUTH-CONTEXT] Navegando a /dashboard");
        router.push("/dashboard");
      }, 4300);
    },
    [router]
  );

  const logout = useCallback(() => {
    console.log("🚪 [AUTH-CONTEXT] Iniciando proceso de logout");
    setIsLoggingOut(true);
    setLogoutSuccess(false); // Muestra el Spinner

    setTimeout(() => {
      console.log(
        "✅ [AUTH-CONTEXT] Logout - Mostrando pantalla de despedida (Mano)"
      );
      setLogoutSuccess(true); // Muestra la Mano
    }, 2000);

    setTimeout(() => {
      console.log("🧹 [AUTH-CONTEXT] Limpiando localStorage");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuth(null);

      setTimeout(() => {
        console.log("🚀 [AUTH-CONTEXT] Redirigiendo a /");
        window.location.href = "/";
      }, 500);
    }, 3500);
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, isLoading, isLoggingIn, isLoggingOut, login, logout }}
    >
      <AnimatePresence>
        {/* Flujo de Login (Spinner -> Checkmark) */}
        {isLoggingIn && (
          <FullScreenLoader
            text="Iniciando Sesión..."
            isSuccess={loginSuccess}
            // No pasamos successIconType, así que usará el default "check"
          />
        )}

        {/* Flujo de Logout (Spinner -> Mano) */}
        {isLoggingOut && (
          <FullScreenLoader
            text="Cerrando Sesión..."
            isSuccess={logoutSuccess}
            successTitle="¡Hasta pronto!"
            successText="Cierre de sesión exitoso"
            successIconType="wave" // <-- CAMBIO: ¡Aquí está la magia!
          />
        )}
      </AnimatePresence>

      {isLoading ? <FullScreenLoader text="Verificando..." /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { auth, isLoading } = useAuth();
  const router = useRouter();

  console.log("🔍 [AUTH-GUARD-INTERNO] Verificando...", {
    isLoading,
    hasAuth: !!auth,
    authEmail: auth?.user?.email,
  });

  useEffect(() => {
    if (!isLoading && !auth) {
      console.log("⚠️ [AUTH-GUARD-INTERNO] No hay auth, redirigiendo a /");
      console.log("🚀 [AUTH-GUARD-INTERNO] Ejecutando router.push('/')");
      router.push("/");
    }
  }, [auth, isLoading, router]);

  if (auth) {
    console.log(
      "✅ [AUTH-GUARD-INTERNO] Usuario autenticado, mostrando contenido"
    );
    return <>{children}</>;
  }

  console.log("⏳ [AUTH-GUARD-INTERNO] Esperando autenticación...");
  return null;
}
