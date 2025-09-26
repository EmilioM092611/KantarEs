// FRONTEND/components/full-screen-loader.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function FullScreenLoader({
  text,
  title,
  isSuccess,
}: {
  text: string;
  title?: string;
  isSuccess?: boolean;
}) {
  const brandName = "KANTARES";

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.4 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { ease: "easeOut", duration: 0.5 },
    },
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } },
  };

  const checkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 0.8, bounce: 0 },
        opacity: { duration: 0.01 },
      },
    },
  };

  const welcomeTextVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { ease: "easeOut", duration: 0.5, delay: 0.5 },
    },
  };

  // --- NUEVA VARIANTE PARA EL SUBTÍTULO ---
  const subtitleVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { ease: "easeOut", duration: 0.5, delay: 0.7 }, // Aparece un poco después del título
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-gray-950/80 backdrop-blur-lg flex flex-col items-center justify-center z-[9999]"
    >
      <AnimatePresence mode="wait">
        {isSuccess ? (
          // --- ESTADO DE ÉXITO CON AJUSTES ---
          <motion.div
            key="success"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center gap-4" // Reducimos el gap para que el subtítulo quede más cerca
          >
            <motion.svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              className="w-24 h-24"
            >
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-white/10"
                strokeWidth="4"
                fill="none"
              />
              <motion.path
                d="M 30 50 L 45 65 L 70 40"
                fill="transparent"
                strokeWidth="6"
                strokeLinecap="round"
                // --- CAMBIO DE COLOR DEL CHECK ---
                className="stroke-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                variants={checkVariants}
              />
            </motion.svg>
            <div className="text-center">
              <motion.h1
                variants={welcomeTextVariants}
                className="text-4xl font-bold text-white tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
              >
                ¡Bienvenido!
              </motion.h1>
              {/* --- NUEVO SUBTÍTULO --- */}
              <motion.p
                variants={subtitleVariants}
                className="text-white/60 text-sm font-medium tracking-wider mt-2"
              >
                Inicio de sesión exitoso
              </motion.p>
            </div>
          </motion.div>
        ) : (
          // --- ESTADO DE CARGA (Sin cambios aquí) ---
          <motion.div
            key="loading"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center gap-6"
          >
            <motion.div variants={itemVariants} className="relative w-24 h-24">
              <svg className="absolute inset-0" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-white/10"
                  strokeWidth="4"
                  fill="none"
                />
              </svg>
              <motion.svg
                className="absolute inset-0 rotate-[-90deg]"
                viewBox="0 0 100 100"
              >
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  initial={{ strokeDashoffset: 1 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                />
              </motion.svg>
              <div className="w-full h-full flex items-center justify-center p-5">
                <Image
                  src="/icon.png"
                  alt="Icono de Micrófono Kantares"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              aria-label={brandName}
              className="text-4xl font-bold text-white tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
            >
              {title || brandName}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-white/60 text-sm font-medium tracking-wider"
            >
              {text}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
