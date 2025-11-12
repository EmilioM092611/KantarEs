"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";

/**
 * Hook de conveniencia sobre el AuthContext
 * - Si requireAuth=true (default) y NO hay sesión, redirige a "/"
 * - Expone { user, token, loading } sin tocar localStorage directamente
 */
export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const {
    auth, // { token, user } | null
    isLoading, // chequeo inicial de sesión
  } = useAuthContext();

  // Redirección si se requiere auth y no hay sesión (cuando termine el chequeo)
  useEffect(() => {
    if (!isLoading && requireAuth && !auth) {
      router.push("/");
    }
  }, [auth, isLoading, requireAuth, router]);

  return {
    user: auth?.user ?? null,
    token: auth?.token ?? null,
    loading: isLoading,
    isAuthenticated: !!auth,
  };
}
