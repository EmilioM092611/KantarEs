// app/dashboard/layout.tsx (VERSIÓN FINAL)
"use client";

import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PageLoader } from "@/components/page-loader";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // CORRECCIÓN DEFINITIVA: useEffect con array vacío []
  useEffect(() => {
    // Esta lógica ahora se ejecutará SÓLO UNA VEZ cuando el layout se monte
    // por primera vez en el lado del cliente.
    const token = localStorage.getItem("token");
    const auth = localStorage.getItem("auth");

    if (!token || !auth) {
      // Si no hay token, no necesitamos hacer nada más, redirigir.
      router.push("/login");
      // No actualizamos estado aquí para evitar renders innecesarios antes de la redirección.
      return;
    }

    // Si hay token, nos autenticamos y terminamos la carga.
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []); // El array vacío es la clave para evitar que se re-ejecute en cada navegación.

  useEffect(() => {
    // Este efecto para el sidebar está correcto y no necesita cambios.
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
  }, []);

  if (isLoading) {
    return <PageLoader text="Verificando sesión..." />;
  }

  if (!isAuthenticated) {
    // Este es un estado de seguridad mientras ocurre la redirección.
    // Muestra el loader en lugar de null para una mejor UX.
    return <PageLoader text="Redirigiendo..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={`transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-72"
        } p-6`}
      >
        <div className="w-full">{children}</div>
      </motion.main>
    </div>
  );
}
