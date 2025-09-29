"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";

// NOTA: Ya no necesitamos 'useState' ni 'useEffect' en este archivo
// porque el layout con Flexbox es mucho más simple.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // La lógica para el estado 'collapsed' ya no es necesaria aquí.
  // El Sidebar gestiona su propio tamaño, y Flexbox se encarga del resto.

  return (
    <AuthGuard>
      <LoadingProvider>
        {/* Usamos Flexbox para estructurar la página */}
        <div className="flex h-screen bg-gray-50">
          {/* El Sidebar es el primer elemento flexible. Su propio código
              controla si mide 18rem (expandido) o 5rem (colapsado). */}
          <Sidebar />

          {/* El contenido principal ahora usa flex-1 para ocupar
              el espacio restante automáticamente. */}
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            // La clase 'ml-xx' ya no es necesaria.
            // 'flex-1' se encarga de que ocupe el espacio restante.
            // 'overflow-y-auto' le da su propio scroll si el contenido es largo.
            className="flex-1 p-6 overflow-y-auto"
          >
            <div className="w-full">{children}</div>
          </motion.main>
        </div>
      </LoadingProvider>
    </AuthGuard>
  );
}
