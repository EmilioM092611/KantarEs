// FRONTEND/hooks/useProfile.tsx
"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  // Datos básicos desde localStorage
  id: number;
  username: string;
  email: string;
  nombre: string;
  rol: string;

  // Datos adicionales que vendrán del endpoint /auth/me o /usuarios/:id
  telefono?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  fecha_nacimiento?: string;
  genero?: string;
  created_at?: string;

  // Campos opcionales que pueden no estar en DB
  direccion?: string;
  biografia?: string;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Función para obtener datos completos del usuario desde el backend
  const fetchCompleteProfile = async (
    userId: number
  ): Promise<UserProfile | null> => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const response = await fetch(`${apiUrl}/usuarios/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudo obtener el perfil completo");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener perfil completo:", error);
      return null;
    }
  };

  // Cargar perfil inicial
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos básicos de localStorage
      const userStr = localStorage.getItem("user");

      if (!userStr) {
        throw new Error("No hay sesión activa");
      }

      const userData = JSON.parse(userStr);

      // Intentar obtener datos completos del backend
      const completeData = await fetchCompleteProfile(userData.id);

      if (completeData) {
        // Combinar datos del localStorage con datos del backend
        setProfile({
          id: userData.id,
          username: userData.username || completeData.username,
          email: userData.email || completeData.email,
          nombre: completeData.nombre || userData.nombre,
          rol: completeData.rol || userData.rol,
          telefono: completeData.telefono,
          apellido_paterno: completeData.apellido_paterno,
          apellido_materno: completeData.apellido_materno,
          fecha_nacimiento: completeData.fecha_nacimiento,
          genero: completeData.genero,
          created_at: completeData.created_at,
          direccion: completeData.direccion,
          biografia: completeData.biografia,
        });
      } else {
        // Si no se puede obtener del backend, usar solo datos de localStorage
        setProfile({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          nombre: userData.nombre,
          rol: userData.rol,
        });
      }
    } catch (err: any) {
      console.error("Error al cargar perfil:", err);
      setError(err.message || "Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  // Actualizar perfil
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!profile) {
        throw new Error("No hay perfil cargado");
      }

      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const response = await fetch(`${apiUrl}/usuarios/${profile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "No se pudo actualizar el perfil");
      }

      const updatedData = await response.json();

      // Actualizar estado local
      setProfile((prev) => (prev ? { ...prev, ...updatedData } : null));

      // Actualizar localStorage si cambió información básica
      if (data.email || data.nombre || data.username) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userData = JSON.parse(userStr);
          const updatedUser = {
            ...userData,
            ...(data.email && { email: data.email }),
            ...(data.nombre && { nombre: data.nombre }),
            ...(data.username && { username: data.username }),
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
    } catch (err: any) {
      console.error("Error al actualizar perfil:", err);
      toast({
        title: "Error",
        description: err.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Refrescar perfil desde el servidor
  const refreshProfile = async () => {
    await loadProfile();
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile,
  };
}
