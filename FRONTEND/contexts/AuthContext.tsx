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
import { AnimatePresence, motion } from "framer-motion";
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

function Blackout({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="blackout"
          className="fixed inset-0 z-[10000] bg-black pointer-events-none transform-gpu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            willChange: "opacity, transform",
            backfaceVisibility: "hidden",
            contain: "layout paint",
          }}
        />
      )}
    </AnimatePresence>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [showBlackout, setShowBlackout] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      setAuth({ token, user: JSON.parse(userStr) });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (data: AuthData) => {
      setIsLoggingIn(true);
      setLoginSuccess(false);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuth(data);

      setTimeout(() => setLoginSuccess(true), 1500);
      setTimeout(() => setIsLoggingIn(false), 4000);
      setTimeout(() => router.push("/dashboard"), 4300);
    },
    [router]
  );

  const logout = useCallback(() => {
    setIsLoggingOut(true);
    setLogoutSuccess(false);

    // 1) Mostrar pantalla de despedida (mano)
    setTimeout(() => {
      setLogoutSuccess(true);
    }, 2000);

    // 2) Iniciar blackout un poco ANTES para cubrir cualquier borde lateral
    //    (ajuste clave para eliminar el artefacto del lado izquierdo)
    setTimeout(() => {
      setShowBlackout(true);
    }, 3800); // <- antes 4000ms

    // 3) Limpiar + navegar
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuth(null);
      // Para que el landing haga fade-in al llegar
      sessionStorage.setItem("revealLanding", "1");
      router.replace("/");
    }, 4300);

    // 4) Ocultar overlays
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 4600);

    setTimeout(() => {
      setShowBlackout(false);
    }, 5100);
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ auth, isLoading, isLoggingIn, isLoggingOut, login, logout }}
    >
      <AnimatePresence>
        {/* Flujo Login */}
        {isLoggingIn && (
          <FullScreenLoader
            text="Iniciando Sesión..."
            isSuccess={loginSuccess}
          />
        )}

        {/* Flujo Logout */}
        {isLoggingOut && (
          <FullScreenLoader
            text="Cerrando Sesión..."
            isSuccess={logoutSuccess}
            successTitle="¡Hasta pronto!"
            successText="Cierre de sesión exitoso"
            successIconType="wave"
          />
        )}
      </AnimatePresence>

      {/* Fundido a negro para cubrir transiciones */}
      <Blackout show={showBlackout} />

      {isLoading ? <FullScreenLoader text="Verificando..." /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
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

  if (auth) return <>{children}</>;
  return null;
}
