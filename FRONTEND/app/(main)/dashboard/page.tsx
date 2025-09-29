"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NotificationsPanel } from "@/components/notifications-panel";
import {
  Search,
  Bell,
  Calendar,
  Clock,
  MoreHorizontal,
  Utensils,
} from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";
import { COLOR_TOKENS } from "@/lib/data/color-tokens";
import {
  metricsData,
  modulesSections,
  recentOrders,
  popularProducts,
} from "@/lib/data/dashboard-data";
import type { ModuleType } from "@/lib/types/dashboard";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { useAuth } from "@/contexts/AuthContext";

// --- INICIO DE LA MEJORA DE SUAVIDAD (VERSIÓN FINAL) ---

// Variante para el contenedor principal.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // Reducimos aún más el escalonamiento para una cascada más rápida.
      staggerChildren: 0.06,
    },
  },
};

// Variante para cada bloque, ahora con animación de tipo 'spring'.
const itemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9, // Empezamos un poco más pequeño para un 'pop' más notorio.
    y: 20, // Añadimos una posición inicial 20px más abajo.
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0, // La posición final es 0.
    filter: "blur(0px)",
    transition: {
      // Esta es la clave: una transición de tipo 'spring'.
      type: "spring",
      damping: 45, // Controla la "fricción". Más alto = menos rebote, cambio de 15 q 25.
      stiffness: 500, // Controla la "fuerza" del resorte. Más alto = más rápido, cambio de 200 a 300.
    },
  },
};

// --- FIN DE LA MEJORA DE SUAVIDAD ---

function useDashboardState(debouncedSearchTerm: string) {
  // ... (El resto de este hook no necesita cambios)
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentTime = now.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const currentDate = now.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const filteredModulesSections = useMemo(() => {
    if (!debouncedSearchTerm) return modulesSections;
    return modulesSections
      .map((section) => ({
        ...section,
        modules: section.modules.filter(
          (m) =>
            m.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            m.description
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase())
        ),
      }))
      .filter((s) => s.modules.length > 0);
  }, [debouncedSearchTerm]);

  return { currentDate, currentTime, filteredModulesSections };
}

export default function DashboardPage() {
  // ... (El resto del componente no necesita cambios)
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const router = useRouter();
  const { auth } = useAuth();
  const [loadingModule, setLoadingModule] = useState<ModuleType | null>(null);

  const handleModuleClick = useCallback(
    (module: ModuleType) => {
      setLoadingModule(module);
      setTimeout(() => router.push(module.href), 300);
    },
    [router]
  );

  const { currentDate, currentTime, filteredModulesSections } =
    useDashboardState(debouncedSearchTerm);

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-1">
            Bienvenido, {auth?.user?.nombre || "Usuario"} 👋
          </h1>
          <div className="flex items-center gap-4 text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm capitalize">{currentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-mono">{currentTime}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar módulo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80 bg-white/90 backdrop-blur-sm border-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-[#ff3b6b]/30"
            />
          </div>
          <NotificationsPanel>
            <Button
              variant="outline"
              size="icon"
              className="relative bg-transparent hover:bg-[#ff3b6b]/10 border-[#ff3b6b]/20"
            >
              <Bell className="h-4 w-4 text-[#ff3b6b]" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#ff3b6b] rounded-full animate-ping" />
            </Button>
          </NotificationsPanel>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/kantares-logo.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {metricsData.map((m) => (
          <Card
            key={m.title}
            className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            style={{
              background: `linear-gradient(145deg, ${
                COLOR_TOKENS[m.tokenKey].hexFrom
              }40, ${COLOR_TOKENS[m.tokenKey].hexTo}60)`,
            }}
          >
            <div className="p-5 relative z-10">
              <div className="relative flex items-start justify-between">
                <div>
                  <p
                    className="text-sm font-medium text-white"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
                  >
                    {m.title}
                  </p>
                  <h3
                    className="text-4xl font-extrabold text-white mt-1 h-10"
                    style={{ textShadow: "0 2px 5px rgba(0,0,0,0.5)" }}
                  >
                    <AnimatedCounter
                      to={m.rawValue}
                      isCurrency={m.isCurrency}
                    />
                  </h3>
                  <p
                    className={`mt-2 text-sm font-bold ${
                      m.changeType === "positive"
                        ? "text-green-300"
                        : "text-red-300"
                    }`}
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                  >
                    {m.change}
                  </p>
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${
                      COLOR_TOKENS[m.tokenKey].hexFrom
                    }, ${COLOR_TOKENS[m.tokenKey].hexTo})`,
                    boxShadow: `0 8px 25px -5px ${
                      COLOR_TOKENS[m.tokenKey].hexTo
                    }80, 0 4px 6px -4px ${COLOR_TOKENS[m.tokenKey].hexTo}80`,
                  }}
                >
                  <m.icon className="w-7 h-7" style={{ color: "#FFFFFF" }} />
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-2 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${
                      COLOR_TOKENS[m.tokenKey].hexFrom
                    }, ${COLOR_TOKENS[m.tokenKey].hexTo})`,
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${m.progress}%` }}
                  transition={{
                    duration: 1.5,
                    ease: "easeOut",
                    delay: 0.5,
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {filteredModulesSections.map((section) => (
        <motion.div key={section.title} variants={itemVariants}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {section.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {section.modules.map((module) => (
              <ModuleCard
                key={module.key}
                module={module}
                token={COLOR_TOKENS[module.tokenKey]}
                onActivate={handleModuleClick}
              />
            ))}
          </div>
        </motion.div>
      ))}

      <AnimatePresence>
        {filteredModulesSections.length === 0 && searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-center py-10"
          >
            <p className="text-gray-600 font-medium">
              No se encontraron módulos para "{searchTerm}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      >
        <Card className="rounded-2xl shadow-2xl bg-white/60 backdrop-blur-xl border border-white/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Órdenes Recientes
              </CardTitle>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentOrders.map((o, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{o.mesa}</p>
                    <p className="text-sm text-gray-500">
                      {o.items} • {o.tiempo}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{o.total}</p>
                  <Badge
                    variant={
                      o.estado === "listo"
                        ? "default"
                        : o.estado === "preparando"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {o.estado}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-2xl bg-white/60 backdrop-blur-xl border border-white/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Productos Populares
              </CardTitle>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {popularProducts.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-black/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, #ff7aa2, #ff3b6b)`,
                    }}
                  >
                    <span className="text-white font-bold text-sm">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{p.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {p.vendidos} vendidos
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">{p.ingresos}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>
        {loadingModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm"
          >
            <div className="bg-white/90 rounded-2xl p-6 shadow-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    ease: "linear",
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <loadingModule.icon className="h-6 w-6 text-[#ff3b6b]" />
                </motion.div>
                <span className="text-gray-700 font-medium">
                  Cargando {loadingModule.title}...
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
