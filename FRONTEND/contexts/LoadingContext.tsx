"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const LoadingContext = createContext<
  { setIsLoading: (loading: boolean) => void } | undefined
>(undefined);

function GlobalLoadingOverlay() {
  const baseText = "Cargando";
  const dots = ["·", "·", "·"];

  const width = typeof window !== "undefined" ? window.innerWidth : 1200;
  const height = typeof window !== "undefined" ? window.innerHeight : 800;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Fondo animado */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-black via-red-900 to-black z-10"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Partículas flotando */}
      {Array.from({ length: 20 }).map((_, i) => {
        const left = Math.random() * width;
        const top = Math.random() * height;
        const travel = 100 + Math.random() * 300;
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500 rounded-full z-20 pointer-events-none"
            initial={{ left, top, opacity: 0, scale: 0.8 }}
            animate={{
              top: [top, top - travel, top],
              opacity: [0, 0.9, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Logo con efecto pulso */}
      <motion.div
        className="relative w-48 h-48 rounded-full overflow-hidden border-4 z-30"
        animate={{
          scale: [1, 1.06, 1],
          boxShadow: [
            "0 0 10px rgba(239,68,68,0.6), 0 0 20px rgba(239,68,68,0.4)",
            "0 0 30px rgba(239,68,68,1), 0 0 60px rgba(239,68,68,0.9)",
            "0 0 10px rgba(239,68,68,0.6), 0 0 20px rgba(239,68,68,0.4)",
          ],
          borderColor: ["#ef4444", "#f97373", "#ef4444"],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/kantares-logo.jpg"
          alt="Logo de Kantares"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </motion.div>

      {/* Texto "Cargando..." con puntos coreografiados sin empalme */}
      <div className="mt-10 flex justify-center z-30">
        <span className="text-2xl font-semibold tracking-wide text-white">
          {baseText}
        </span>

        {dots.map((dot, index) => (
          <motion.span
            key={index}
            className="text-2xl font-semibold tracking-wide text-white inline-block"
            animate={{ y: ["0%", "-40%", "0%"] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.6,
              repeatDelay: 0.6,
            }}
            style={{ marginLeft: "2px" }}
          >
            {dot}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

// ===============================================================
// ----- PROVIDER -----
// ===============================================================
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <LoadingContext.Provider value={{ setIsLoading }}>
      <AnimatePresence>{isLoading && <GlobalLoadingOverlay />}</AnimatePresence>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading debe ser usado dentro de un LoadingProvider");
  }
  return context;
}
