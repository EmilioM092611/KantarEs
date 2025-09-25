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

interface AuthData {
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

  // --- LÓGICA DE LOGIN CORREGIDA ---
  const login = useCallback(
    (data: AuthData) => {
      // 1. Guardamos los datos de autenticación inmediatamente.
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuth(data);

      // 2. Mostramos el loader de inicio de sesión.
      setIsLoggingIn(true);

      // 3. Esperamos a que la animación del loader se muestre
      //    y luego redirigimos.
      setTimeout(() => {
        router.push("/dashboard");
        // Mantenemos el loader visible un poco más para cubrir la carga de la página.
        setTimeout(() => {
          setIsLoggingIn(false);
        }, 300); // 0.3s de margen
      }, 2500); // 2.5s para la animación
    },
    [router]
  );

  const logout = useCallback(() => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuth(null);
      window.location.href = "/";
    }, 2500);
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, isLoading, isLoggingIn, isLoggingOut, login, logout }}
    >
      <AnimatePresence>
        {isLoggingIn && <FullScreenLoader text="Iniciando Sesión..." />}
        {isLoggingOut && (
          <FullScreenLoader title="Hasta pronto" text="Cerrando Sesión..." />
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
