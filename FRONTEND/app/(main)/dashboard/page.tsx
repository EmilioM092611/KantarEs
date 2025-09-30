"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  X,
  ChevronRight,
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

/* =======================  Animaciones bases  ======================= */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 45, stiffness: 500 },
  },
};

/* =======================  Estado derivado del dashboard  ======================= */

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
    const q = debouncedSearchTerm.toLowerCase();
    return modulesSections
      .map((section) => ({
        ...section,
        modules: section.modules.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.modules.length > 0);
  }, [debouncedSearchTerm]);

  return { currentDate, currentTime, filteredModulesSections };
}

/* =======================  Loader de módulo  ======================= */

function ModuleLoadingOverlay({
  module,
  onCancel,
}: {
  module: ModuleType;
  onCancel?: () => void;
}) {
  const shouldReduce = useReducedMotion();

  const token = COLOR_TOKENS[module.tokenKey];
  const from = token?.hexFrom ?? "#ff7aa2";
  const to = token?.hexTo ?? "#ff3b6b";

  const [progress, setProgress] = React.useState(8);
  const tips = React.useMemo(
    () => [
      "Preparando panel…",
      "Sincronizando datos…",
      "Verificando permisos…",
      "Aplicando preferencias…",
    ],
    []
  );
  const [tipIndex, setTipIndex] = React.useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) =>
        p < 90 ? p + Math.max(1, Math.round((100 - p) / 18)) : p
      );
    }, 120);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setTipIndex((i) => (i + 1) % tips.length),
      1400
    );
    return () => clearInterval(id);
  }, [tips.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Fondo a pantalla completa con el tema del módulo */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(1200px 600px at 60% -10%, ${to}22, transparent 60%),
                        radial-gradient(1000px 600px at 20% 110%, ${from}22, transparent 60%),
                        linear-gradient(135deg, ${from}33, ${to}33)`,
        }}
      />
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className="relative w-[min(94vw,780px)] rounded-3xl border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl px-6 py-7"
        style={{
          boxShadow: `0 30px 120px -24px ${to}55, 0 10px 30px -14px ${from}55`,
        }}
      >
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff3b6b]/40"
            aria-label="Cancelar carga"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        )}

        <div className="flex flex-wrap items-center gap-3 pr-10">
          <nav className="flex items-center gap-1 text-sm text-gray-500">
            <span className="hover:text-gray-700">KantarEs</span>
            <ChevronRight className="h-4 w-4 opacity-60" />
            <span className="text-gray-700 font-medium truncate max-w-[40ch]">
              {module.title}
            </span>
          </nav>
          <span className="ml-auto shrink-0 tabular-nums text-sm font-semibold text-gray-700">
            {progress}%
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <motion.div
            animate={
              shouldReduce
                ? {}
                : {
                    y: [-2, 2, -2],
                    boxShadow: [
                      `0 8px 22px ${to}35`,
                      `0 14px 28px ${to}45`,
                      `0 8px 22px ${to}35`,
                    ],
                  }
            }
            transition={
              shouldReduce
                ? {}
                : { duration: 1.6, ease: "easeInOut", repeat: Infinity }
            }
            className="grid h-14 w-14 place-items-center rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            <module.icon className="h-7 w-7 text-white" />
          </motion.div>

          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              Cargando <span className="text-gray-800">{module.title}</span>
            </h2>
            <p className="mt-0.5 text-sm text-gray-600">{tips[tipIndex]}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
            <motion.div
              className="h-2"
              style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
              initial={{ width: "6%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.35 }}
            />
          </div>
          <motion.div
            aria-hidden="true"
            className="relative -mt-2 h-2 w-full overflow-hidden rounded-full"
          >
            <motion.div
              className="absolute inset-0 opacity-25"
              style={{
                background:
                  "repeating-linear-gradient(135deg, #fff, #fff 8px, transparent 8px, transparent 16px)",
                mixBlendMode: "overlay",
              }}
              animate={
                shouldReduce ? {} : { backgroundPositionX: ["0%", "100%"] }
              }
              transition={
                shouldReduce
                  ? {}
                  : { duration: 1.2, repeat: Infinity, ease: "linear" }
              }
            />
          </motion.div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>Optimizado para conexiones locales</span>
          <span>Si tarda demasiado, puedes cancelar.</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =======================  Página  ======================= */

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const router = useRouter();
  const { auth } = useAuth();
  const [loadingModule, setLoadingModule] = useState<ModuleType | null>(null);

  const handleModuleClick = useCallback(
    (module: ModuleType) => {
      // Muestra loader
      setLoadingModule(module);
      // Da un respiro al overlay y navega. La cortina global vive en el layout.
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
      {/* Header */}
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

      {/* Hero/banner responsive */}
      <motion.div
        variants={itemVariants}
        className="relative aspect-[16/5] w-full rounded-3xl overflow-hidden shadow-2xl"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/kantares-logo.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
      </motion.div>

      {/* Métricas */}
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
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Módulos */}
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

      {/* Sin resultados */}
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

      {/* Listas inferiores */}
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
                className="flex items-center justify-between p-3 rounded-lg hover:bg黑/5 transition-colors"
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

      {/* Overlay de carga por módulo */}
      <AnimatePresence>
        {loadingModule && (
          <ModuleLoadingOverlay
            module={loadingModule}
            onCancel={() => setLoadingModule(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
