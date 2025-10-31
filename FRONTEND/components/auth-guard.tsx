// FRONTEND/components/auth-guard.tsx
// VERSION CON LOGS DE DIAGNÓSTICO
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

  // ✅ Rutas públicas - SIN /login
  const publicRoutes = ["/", "/register", "/forgot-password"];

  useEffect(() => {
    console.log("🔍 [AUTH-GUARD] Iniciando verificación...");
    console.log("📍 [AUTH-GUARD] Pathname actual:", pathname);
    console.log("🔓 [AUTH-GUARD] Rutas públicas:", publicRoutes);

    const checkAuth = async () => {
      // Si es una ruta pública, no verificar autenticación
      if (publicRoutes.includes(pathname)) {
        console.log(
          "✅ [AUTH-GUARD] Ruta pública detectada, permitiendo acceso"
        );
        setIsChecking(false);
        return;
      }

      // Pequeño delay para asegurar que el localStorage esté disponible
      await new Promise((resolve) => setTimeout(resolve, 100));

      const token = localStorage.getItem("token");

      console.log("🔐 [AUTH-GUARD] Verificando autenticación:", {
        pathname,
        hasToken: !!token,
        token: token ? `${token.substring(0, 20)}...` : null,
      });

      // Si no hay token y no es una ruta pública, redirigir a la raíz (/)
      if (!token && !publicRoutes.includes(pathname)) {
        console.log("⚠️ [AUTH-GUARD] No autenticado, redirigiendo a /");
        console.log("🚀 [AUTH-GUARD] Ejecutando router.push('/')");
        router.push("/");
        return;
      }

      // Si hay token y está en la raíz, redirigir a dashboard
      if (token && pathname === "/") {
        console.log(
          "✅ [AUTH-GUARD] Usuario autenticado en /, redirigiendo a /dashboard"
        );
        console.log("🚀 [AUTH-GUARD] Ejecutando router.push('/dashboard')");
        router.push("/dashboard");
        return;
      }

      console.log(
        "✅ [AUTH-GUARD] Verificación completada, mostrando contenido"
      );
      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Mientras verifica, mostrar loader solo si NO es una ruta pública
  if (isChecking && !publicRoutes.includes(pathname)) {
    console.log("⏳ [AUTH-GUARD] Mostrando loader de verificación");
    return <PageLoader text="Verificando sesión..." />;
  }

  console.log("✅ [AUTH-GUARD] Renderizando children");
  return <>{children}</>;
}
