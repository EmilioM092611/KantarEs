// FRONTEND/hooks/useLoginForm.ts
// Hook mejorado para el login usando authService

"use client";

import { useState } from "react";
import { useAuth, type AuthData } from "@/contexts/AuthContext";
import { authService } from "@/lib/api/auth";

export function useLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    setError("");
    setIsLoading(true);
    setIsSuccess(false); // 🔧 CORRECCIÓN: Asegurar que isSuccess es false al inicio

    let wasSuccessful = false;

    try {
      // ✅ MEJORA: Usar authService en lugar de fetch directo
      // El backend usa "email" para el campo de username según tu API
      const response = await authService.login({
        username: username, // El backend espera "email"
        password,
      });

      // Si llegamos aquí, el login fue exitoso
      wasSuccessful = true;
      setIsSuccess(true);

      // Preparar datos de autenticación
      const authData: AuthData = {
        token: response.access_token,
        user: {
          id: response.user.id_usuario,
          username: response.user.username || response.user.email || "Usuario", // Usar parte del email como username
          email: response.user.email,
          nombre:
            response.user.nombre ||
            response.user.apellido ||
            "Usuario KantarEs",
          rol: response.user.rol,
        },
      };

      // Esperar 1.2 segundos antes de redirigir (para animaciones)
      setTimeout(() => {
        login(authData);
      }, 1200);
    } catch (err: any) {
      console.error("Error de autenticación:", err);

      // 🔧 CORRECCIÓN: Asegurar que no se llame a login() cuando hay error
      wasSuccessful = false;
      setIsSuccess(false);

      // Mensajes de error más específicos
      if (err.message.includes("401")) {
        setError("Usuario o contraseña incorrectos");
      } else if (err.message.includes("Network")) {
        setError("Error de conexión con el servidor");
      } else {
        setError(err.message || "Error al iniciar sesión");
      }
    } finally {
      // 🔧 CORRECCIÓN: Solo resetear isLoading si no fue exitoso
      // Esto previene que el usuario pueda hacer clic nuevamente mientras se redirige
      if (!wasSuccessful) {
        setIsLoading(false);
        setIsSuccess(false);
      }
      // Si fue exitoso, isLoading permanece true hasta que se complete la redirección
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    isLoading,
    isSuccess,
    handleLogin,
  };
}
