"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sidebar } from "@/components/sidebar";
import { AuthGuard } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";

/* Gradiente rojo oscuro (sin rosa) */
const GRADIENT =
  "linear-gradient(135deg, #9E0F22 0%, #7D0E1C 48%, #3C0710 100%)";
/* Viñeta sutil para profundidad */
const VIGNETTE =
  "radial-gradient(120% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.30) 100%)";
/* Grain estático (muy suave, sin animar) */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'>\
<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter>\
<rect width='100%' height='100%' filter='url(%23n)' opacity='0.05'/>\
</svg>\")";

/* Timings rápidos (transform-only) */
const EXIT_T = { duration: 0.24, ease: [0.25, 0.9, 0.3, 1] as any };
const ENTER_T = { duration: 0.2, ease: [0.25, 0.9, 0.3, 1] as any };

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <AuthGuard>
      <LoadingProvider>
        <AnimatePresence mode="wait">
          <motion.div key={pathname}>
            <div className="flex h-screen bg-gray-50">
              <Sidebar />
              <main className="flex-1 overflow-y-auto min-w-0">
                <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  {children}
                </div>
              </main>
            </div>

            {/* ============ EXIT (cubre de abajo hacia arriba) ============ */}
            <motion.div
              className="fixed inset-0 z-[100] pointer-events-none origin-bottom"
              style={{
                backgroundImage: `${GRADIENT}, ${VIGNETTE}`,
                backgroundBlendMode: "normal, multiply",
                willChange: "transform",
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 0 }}
              exit={{ scaleY: 1 }}
              transition={EXIT_T}
            >
              {/* Rim light micro (barata) */}
              <div
                className="absolute top-0 left-0 right-0 h-[10px] opacity-25"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0))",
                }}
              />
              {/* Grain estático (sin animar) */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: GRAIN,
                  mixBlendMode: "soft-light",
                  pointerEvents: "none",
                }}
              />
              {/* Sheen ligero (transform-only, sin blur) */}
              {!reduce && (
                <motion.div
                  className="absolute -inset-y-16 -inset-x-24 opacity-0"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.14) 28%, rgba(255,255,255,0) 62%)",
                    willChange: "transform, opacity",
                  }}
                  initial={{ x: "-35%" }}
                  exit={{ x: "115%", opacity: 0.18 }}
                  transition={{ ...EXIT_T, duration: 0.26 }}
                />
              )}
            </motion.div>

            {/* ============ ENTER (se retira hacia arriba) ============ */}
            <motion.div
              className="fixed inset-0 z-[100] pointer-events-none origin-top"
              style={{
                backgroundImage: `${GRADIENT}, ${VIGNETTE}`,
                backgroundBlendMode: "normal, multiply",
                willChange: "transform",
              }}
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              transition={ENTER_T}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[10px] opacity-25"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0))",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: GRAIN,
                  mixBlendMode: "soft-light",
                  pointerEvents: "none",
                }}
              />
              {!reduce && (
                <motion.div
                  className="absolute -inset-y-16 -inset-x-24 opacity-0"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 28%, rgba(255,255,255,0) 62%)",
                    willChange: "transform, opacity",
                  }}
                  initial={{ x: "-35%" }}
                  animate={{ x: "115%", opacity: 0.16 }}
                  transition={{ ...ENTER_T, duration: 0.22 }}
                />
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </LoadingProvider>
    </AuthGuard>
  );
}
