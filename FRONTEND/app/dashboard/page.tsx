// app/dashboard/page.tsx (VERSIÓN FINAL)
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

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const router = useRouter();

  // Puedes re-activar tu hook de transición si lo deseas,
  // o seguir usando el router simple.
  // const { navigateWithTransition, isTransitioning } = usePageTransition();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingModule, setLoadingModule] = useState<ModuleType | null>(null);

  const handleModuleClick = useCallback(
    (module: ModuleType) => {
      setLoadingModule(module);
      setIsTransitioning(true);
      // Simulación de una transición de página
      setTimeout(() => router.push(module.href), 300);
    },
    [router]
  );

  const { now, currentDate, currentTime, filteredModulesSections } =
    useDashboardState(debouncedSearchTerm);

  const staggerGridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const staggerItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
            Bienvenido, Usuario 👋
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
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
      </div>

      <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ backgroundImage: 'url("/kantares-logo.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
      </div>

      <motion.div
        variants={staggerGridVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {metricsData.map((m) => (
          <motion.div key={m.title} variants={staggerItemVariants}>
            <Card
              className="relative rounded-2xl overflow-hidden backdrop-blur-xl border border-white/10 shadow-2xl text-white"
              style={{
                background: `linear-gradient(145deg, ${
                  COLOR_TOKENS[m.tokenKey].hexFrom
                }40, ${COLOR_TOKENS[m.tokenKey].hexTo}60)`,
              }}
            >
              <div className="p-5 relative z-10">
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm text-white/80">{m.title}</p>
                    <h3 className="text-3xl font-bold text-white mt-1 h-10">
                      {m.isCurrency ? (
                        <AnimatedCounter to={m.rawValue} isCurrency />
                      ) : m.value.includes("/") ? (
                        <>
                          <AnimatedCounter to={m.rawValue} />
                          <span className="text-white/80">
                            {m.value.substring(m.value.indexOf("/"))}
                          </span>
                        </>
                      ) : (
                        <AnimatedCounter to={m.rawValue} />
                      )}
                    </h3>
                    <p
                      className={`mt-2 text-sm ${
                        m.changeType === "positive"
                          ? "text-green-300"
                          : "text-amber-300"
                      }`}
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
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${m.progress}%`,
                      background: `linear-gradient(90deg, ${
                        COLOR_TOKENS[m.tokenKey].hexFrom
                      }, ${COLOR_TOKENS[m.tokenKey].hexTo})`,
                    }}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredModulesSections.map((section) => (
        <div key={section.title}>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold text-gray-900 mb-6"
          >
            {section.title}
          </motion.h2>
          <motion.div
            variants={staggerGridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10"
          >
            {section.modules.map((module) => (
              <motion.div key={module.key} variants={staggerItemVariants}>
                <ModuleCard
                  module={module}
                  token={COLOR_TOKENS[module.tokenKey]}
                  onActivate={handleModuleClick}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
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
        variants={staggerGridVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      >
        <motion.div variants={staggerItemVariants}>
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
        </motion.div>
        <motion.div variants={staggerItemVariants}>
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
      </motion.div>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm"
          >
            {loadingModule && (
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper hook para organizar el estado
function useDashboardState(debouncedSearchTerm: string) {
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

  return { now, currentDate, currentTime, filteredModulesSections };
}
