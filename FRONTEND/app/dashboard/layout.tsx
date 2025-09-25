"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/contexts/AuthContext"; // Importar el nuevo AuthGuard

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`transition-all duration-300 ${
            collapsed ? "ml-20" : "ml-72"
          } p-6`}
        >
          <div className="w-full">{children}</div>
        </motion.main>
      </div>
    </AuthGuard>
  );
}
