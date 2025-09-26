// FRONTEND/contexts/AuthContext.tsx
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
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        setAuth({ token, user: JSON.parse(userStr) });
      }
    } catch (error) {
      console.error("Error al cargar datos de autenticación:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    (data: AuthData) => {
      setIsLoggingIn(true);
      setLoginSuccess(false);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuth(data);

      // 1. Mostrar la rueda de carga por 1.5 segundos. (SIN CAMBIOS)
      setTimeout(() => {
        setLoginSuccess(true);
      }, 1500);

      // --- INICIO DE LA CORRECCIÓN ---
      // 2. Ocultar el loader después de 4 segundos en total.
      //    (1.5s de carga + 2.5s de éxito).
      setTimeout(() => {
        setIsLoggingIn(false);
      }, 4000); // Antes 3000ms, ahora 4000ms

      // 3. NAVEGAR a la nueva página DESPUÉS de que la animación
      //    del loader se haya completado.
      setTimeout(() => {
        router.push("/dashboard");
      }, 4300); // Antes 3300ms, ahora 4300ms
      // --- FIN DE LA CORRECCIÓN ---
    },
    [router]
  );

  const logout = useCallback(() => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuth(null);
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }, 2500);
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, isLoading, isLoggingIn, isLoggingOut, login, logout }}
    >
      <AnimatePresence>
        {isLoggingIn && (
          <FullScreenLoader
            text="Iniciando Sesión..."
            isSuccess={loginSuccess}
          />
        )}
        {isLoggingOut && (
          <FullScreenLoader title="¡Hasta pronto!" text="Cerrando Sesión..." />
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

  useEffect(() => {
    if (!isLoading && !auth) {
      router.push("/");
    }
  }, [auth, isLoading, router]);

  if (auth) {
    return <>{children}</>;
  }

  return null;
}
