"use client";

import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/page-loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificación de autenticación más simple
    const checkAuth = () => {
      // No usar async/await aquí para evitar problemas de timing
      const token = localStorage.getItem("token");
      const auth = localStorage.getItem("auth");

      console.log("Dashboard Layout - Verificando:", {
        hasToken: !!token,
        hasAuth: !!auth,
      });

      if (!token || !auth) {
        console.log("Dashboard: No hay autenticación, redirigiendo a login");
        router.push("/login");
        return;
      }

      try {
        const authData = JSON.parse(auth);
        console.log("Usuario autenticado:", authData.username);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (e) {
        console.error("Error parseando auth:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        router.push("/login");
      }
    };

    // Verificar inmediatamente
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleSidebarToggle = (event: CustomEvent) => {
      setCollapsed(event.detail.collapsed);
    };

    window.addEventListener(
      "sidebarToggle",
      handleSidebarToggle as EventListener
    );

    return () =>
      window.removeEventListener(
        "sidebarToggle",
        handleSidebarToggle as EventListener
      );
  }, [isAuthenticated]);

  if (isLoading) {
    return <PageLoader text="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    return null; // No mostrar nada mientras redirige
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main
        className={`transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-72"
        } p-6`}
      >
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
