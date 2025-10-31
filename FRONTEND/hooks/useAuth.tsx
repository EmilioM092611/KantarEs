// FRONTEND/hooks/useAuth.tsx
// VERSION CON LOGS DE DIAGNÓSTICO
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(requireAuth: boolean = true) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 [USE-AUTH] Hook iniciado, requireAuth:", requireAuth);

    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      console.log("🔐 [USE-AUTH] Verificando localStorage:", {
        hasToken: !!token,
        hasUser: !!userStr,
        requireAuth,
      });

      // Si requiere auth y no hay token, redirigir a la raíz (/)
      if (requireAuth && !token) {
        console.log("⚠️ [USE-AUTH] No hay token y se requiere auth");
        console.log("🚀 [USE-AUTH] Redirigiendo a /");
        router.push("/");
        return;
      }

      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          console.log(
            "✅ [USE-AUTH] Usuario parseado correctamente:",
            parsedUser.email
          );
          setUser(parsedUser);
        } catch (error) {
          console.error(
            "❌ [USE-AUTH] Error al parsear datos de usuario:",
            error
          );
          // Si hay error al parsear, limpiar localStorage y redirigir
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          console.log("🧹 [USE-AUTH] localStorage limpiado");
          console.log("🚀 [USE-AUTH] Redirigiendo a /");
          router.push("/");
          return;
        }
      }

      console.log("✅ [USE-AUTH] Verificación completada");
      setLoading(false);
    };

    checkAuth();
  }, [requireAuth, router]);

  return { user, loading };
}
