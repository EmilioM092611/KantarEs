"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // el nuevo hook de arriba
import { PageLoader } from "@/components/page-loader"; // si no lo tienes, cámbialo por tu loader

interface AuthGuardProps {
  children: React.ReactNode;
  /**
   * Rutas públicas (además de "/", "/register", "/forgot-password" por defecto).
   * Puedes sobreescribirlas pasando un array aquí si lo necesitas.
   */
  publicRoutes?: string[];
}

export function AuthGuard({ children, publicRoutes }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading, token } = useAuth(false); // no forzamos redirect aquí, lo hacemos nosotros
  const [checking, setChecking] = useState(true);

  // Rutas públicas por defecto + extendidas
  const allowedPublic = useMemo(
    () =>
      new Set(["/", "/register", "/forgot-password", ...(publicRoutes ?? [])]),
    [publicRoutes]
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Si es ruta pública, no hay chequeos de auth
      if (allowedPublic.has(pathname)) {
        setChecking(false);
        return;
      }

      // Aseguramos que terminó el chequeo de sesión inicial
      if (loading) {
        setChecking(true);
        return;
      }

      // Si no hay token/sesión en una ruta protegida → a "/"
      if (!isAuthenticated || !token) {
        router.push("/");
        return;
      }

      // Si hay token y estamos en raíz, llévalo al dashboard
      if (token && pathname === "/") {
        router.push("/dashboard");
        return;
      }

      // Listo para mostrar children
      if (!cancelled) setChecking(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [allowedPublic, isAuthenticated, loading, pathname, router, token]);

  // Mientras verificamos una ruta protegida, muestra un loader
  if (checking && !allowedPublic.has(pathname)) {
    return <PageLoader text="Verificando sesión..." />;
  }

  return <>{children}</>;
}
