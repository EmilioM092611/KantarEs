"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const LoadingContext = createContext<
  { setIsLoading: (loading: boolean) => void } | undefined
>(undefined);

// ==================================================================
// ----- PANTALLA DE CARGA CON EFECTO NEÓN -----
// ==================================================================
function GlobalLoadingOverlay() {
  const text = "Cargando...";
  const letters = Array.from(text);

  // Variantes para las letras (movimiento ondulante)
  const letterVariants = {
    initial: { y: "0%" },
    animate: { y: "-40%" },
  };

  const letterTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "easeInOut",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Fondo con gradiente animado */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-black via-red-900 to-black"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Partículas suaves */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-red-500 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth - window.innerWidth / 2,
            y: Math.random() * window.innerHeight - window.innerHeight / 2,
            opacity: 0,
          }}
          animate={{
            y: [Math.random() * -200, Math.random() * 200],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Logo con efecto de pulso + neón */}
      <motion.div
        className="relative w-48 h-48 rounded-full overflow-hidden border-4"
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 10px rgba(239,68,68,0.6), 0 0 20px rgba(239,68,68,0.4)",
            "0 0 25px rgba(239,68,68,1), 0 0 50px rgba(239,68,68,0.9)",
            "0 0 10px rgba(239,68,68,0.6), 0 0 20px rgba(239,68,68,0.4)",
          ],
          borderColor: ["#ef4444", "#f87171", "#ef4444"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/kantares-logo.jpg"
          alt="Logo de Kantares"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </motion.div>

      {/* Texto animado con neón */}
      <div className="mt-10 flex justify-center">
        {letters.map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            className="text-3xl font-extrabold tracking-wider text-white"
            variants={letterVariants}
            initial="initial"
            animate="animate"
            transition={{ ...letterTransition, delay: index * 0.12 }}
            animate={{
              textShadow: [
                "0 0 5px rgba(255,255,255,0.6), 0 0 10px rgba(255,255,255,0.3)",
                "0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.8)",
                "0 0 5px rgba(255,255,255,0.6), 0 0 10px rgba(255,255,255,0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.15,
            }}
          >
            {letter === " " ? "\u00A0" : letter}
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
