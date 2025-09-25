"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function FullScreenLoader({
  text,
  title,
}: {
  text: string;
  title?: string;
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
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { ease: "easeOut", duration: 0.5 },
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
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
              // --- INICIO DEL CAMBIO (RUEDA) ---
              // Aumentamos el radio del brillo de 5px a 8px y la opacidad de 0.7 a 0.8
              className="stroke-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              // --- FIN DEL CAMBIO (RUEDA) ---
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              initial={{ strokeDashoffset: 1 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
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
          // --- INICIO DEL CAMBIO (TEXTO) ---
          // Aumentamos el radio del brillo de 8px a 10px y la opacidad de 0.2 a 0.35
          className="text-4xl font-bold text-white tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
          // --- FIN DEL CAMBIO (TEXTO) ---
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
    </motion.div>
  );
}
