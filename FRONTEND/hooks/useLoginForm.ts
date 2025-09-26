"use client";

import { useState } from "react";
import { useAuth, type AuthData } from "@/contexts/AuthContext";

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

    let wasSuccessful = false;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error(
          "Error de configuración: La URL de la API no está definida."
        );
      }

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok && data.access_token) {
        wasSuccessful = true;
        setIsSuccess(true);
        const authData: AuthData = {
          token: data.access_token,
          user: {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            nombre: data.user.nombre || "Usuario KantarEs",
            rol: data.user.rol,
          },
        };

        setTimeout(() => {
          login(authData);
        }, 1200);
      } else {
        setError(data.message || "Usuario o contraseña incorrectos");
      }
    } catch (err: any) {
      console.error("Error de conexión:", err);
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      if (!wasSuccessful) {
        setIsLoading(false);
      }
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
