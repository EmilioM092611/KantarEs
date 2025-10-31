// FRONTEND/components/full-screen-loader.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image"; // Para el logo de KantarEs en el spinner

// --- COMIENZA EL CAMBIO: Icono de Salida (Puerta y Flecha) ---
function LogoutIcon() {
  // Trazado SVG para un icono de "Logout" (puerta y flecha)
  // Consiste en dos partes en un mismo 'd' para que se animen en secuencia
  const logoutPath =
    // 1. El marco de la puerta (abierto a la derecha)
    "M 60 25 H 40 C 35 25 30 30 30 35 V 75 C 30 80 35 85 40 85 H 60" +
    // 2. La flecha saliendo (M = Mover, L = Línea)
    " M 50 55 H 80 M 75 50 L 80 55 L 75 60";

  // Variantes para la animación de "dibujado"
  const iconVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring", duration: 1.2, bounce: 0 },
        opacity: { duration: 0.1 },
      },
    },
  };

  return (
    // Contenedor para la animación de entrada (aparecer)
    <motion.div
      className="w-24 h-24 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Es estático, no tiene la animación de "rotate" */}

      {/* El SVG que dibuja el icono */}
      <motion.svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        className="w-24 h-24" // Mismo tamaño que el checkmark
      >
        {/* El trazado (path) del icono */}
        <motion.path
          d={logoutPath} // Usamos el nuevo trazado
          fill="transparent"
          strokeWidth="6" // Mismo grosor que el checkmark
          strokeLinecap="round"
          strokeLinejoin="round"
          // Mismo estilo rojo con sombra que el checkmark
          className="stroke-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          variants={iconVariants} // Aplica la animación de dibujado
          initial="hidden"
          animate="visible"
        />
      </motion.svg>
    </motion.div>
  );
}
// --- FIN DEL CAMBIO ---

export function FullScreenLoader({
  text,
  title,
  isSuccess,
  successTitle,
  successText,
  successIconType = "check",
}: {
  text: string;
  title?: string;
  isSuccess?: boolean;
  successTitle?: string;
  successText?: string;
  successIconType?: "check" | "wave"; // La prop se sigue llamando "wave"
}) {
  const brandName = "KantarEs";

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

  // Variantes para el checkmark (original, sin cambios)
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

  const subtitleVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { ease: "easeOut", duration: 0.5, delay: 0.7 },
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
          // --- ESTADO DE ÉXITO (Checkmark o Icono de Logout) ---
          <motion.div
            key="success"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center justify-center gap-4"
          >
            {/* Lógica para mostrar icono */}
            {successIconType === "wave" ? (
              // ¡Aquí se llama al nuevo icono estático de "salida"!
              <LogoutIcon />
            ) : (
              // El checkmark original
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
                  className="stroke-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  variants={checkVariants}
                />
              </motion.svg>
            )}

            <div className="text-center">
              <motion.h1
                variants={welcomeTextVariants}
                className="text-4xl font-bold text-white tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
              >
                {/* Asegúrate de pasar el título correcto, ej: "¡Hasta pronto!" */}
                {successTitle || "¡Bienvenido!"}
              </motion.h1>
              <motion.p
                variants={subtitleVariants}
                className="text-white/60 text-sm font-medium tracking-wider mt-2"
              >
                {/* Asegúrate de pasar el texto correcto, ej: "Cierre de sesión exitoso" */}
                {successText || "Inicio de sesión exitoso"}
              </motion.p>
            </div>
          </motion.div>
        ) : (
          // --- ESTADO DE CARGA (Spinner) (SIN CAMBIOS) ---
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
