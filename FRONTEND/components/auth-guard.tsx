"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PageLoader } from "@/components/page-loader";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Rutas que NO requieren autenticación
  const publicRoutes = ["/login", "/", "/register", "/forgot-password"];

  useEffect(() => {
    const checkAuth = async () => {
      // Si es una ruta pública, no verificar autenticación
      if (publicRoutes.includes(pathname)) {
        setIsChecking(false);
        return;
      }

      // Pequeño delay para asegurar que el localStorage esté disponible
      await new Promise((resolve) => setTimeout(resolve, 100));

      const token = localStorage.getItem("token");
      const auth = localStorage.getItem("auth");

      console.log("AuthGuard - Verificando ruta:", pathname, {
        hasToken: !!token,
        hasAuth: !!auth,
      });

      // Si no hay token y no es una ruta pública, redirigir a login
      if (!token && !publicRoutes.includes(pathname)) {
        console.log("AuthGuard: No autenticado, redirigiendo a login");
        router.push("/login");
        return;
      }

      // Si hay token y está en login, redirigir a dashboard
      if (token && pathname === "/login") {
        console.log("AuthGuard: Ya autenticado, redirigiendo a dashboard");
        router.push("/dashboard");
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Mientras verifica, mostrar loader solo si NO es una ruta pública
  if (isChecking && !publicRoutes.includes(pathname)) {
    return <PageLoader text="Verificando sesión..." />;
  }

  return <>{children}</>;
}
