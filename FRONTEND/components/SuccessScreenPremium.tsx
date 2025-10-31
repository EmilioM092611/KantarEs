"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================
// TIPOS E INTERFACES
// ============================================

type SuccessVariant = "create" | "edit" | "delete" | "custom";

interface SuccessScreenPremiumProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: SuccessVariant;
  title?: string;
  description?: string;
  autoCloseDelay?: number;
  showCloseButton?: boolean;
  icon?: React.ReactNode;
  accentColor?: string;
  userName?: string;
}

// ============================================
// COMPONENTE PRINCIPAL (CORREGIDO Y CON MEJORAS)
// ============================================

export const SuccessScreenPremium: React.FC<SuccessScreenPremiumProps> = ({
  isOpen,
  onClose,
  variant = "create",
  title,
  description,
  autoCloseDelay = 3000,
  showCloseButton = true,
  icon,
  accentColor = "rgb(239, 68, 68)",
  userName,
}) => {
  // Configuración de variantes
  const variantConfig = {
    create: {
      title: userName ? `¡${userName} Creado!` : "¡Creado Exitosamente!",
      description: "El registro ha sido creado correctamente en el sistema.",
      icon: <Check className="w-14 h-14" strokeWidth={3} />,
    },
    edit: {
      title: userName
        ? `¡${userName} Actualizado!`
        : "¡Actualizado Exitosamente!",
      description: "Los cambios han sido guardados correctamente.",
      icon: <Check className="w-14 h-14" strokeWidth={3} />,
    },
    delete: {
      title: "¡Eliminado Exitosamente!",
      description: "El registro ha sido eliminado del sistema.",
      icon: <Check className="w-14 h-14" strokeWidth={3} />,
    },
    custom: {
      title: title || "¡Operación Exitosa!",
      description: description || "La operación se completó correctamente.",
      icon: icon || <Check className="w-14 h-14" strokeWidth={3} />,
    },
  };

  const config = variantConfig[variant];
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayIcon = icon || config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="success-screen-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 bg-gray-900/70 backdrop-blur-lg"
          />

          {/* Contenedor principal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -150,
              transition: {
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              },
            }}
            transition={{
              duration: 1.0,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative w-full max-w-lg"
          >
            {/* Card oscuro */}
            <div className="relative rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.7)]">
              {/* Fondo oscuro con gradiente ajustado */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 to-slate-950/95 backdrop-blur-2xl" />

              {/* Borde superior animado */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
                  backgroundSize: "200% 100%",
                }}
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  delay: 1.5,
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Borde Fino Iluminado Superior */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-70" />

              {/* Barra de progreso inferior */}
              {autoCloseDelay > 0 && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 rounded-b-3xl origin-left"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 24px ${accentColor}`,
                  }}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{
                    delay: 2.0,
                    duration: autoCloseDelay / 1000,
                    ease: "linear",
                  }}
                  onAnimationComplete={() => {
                    if (isOpen) {
                      onClose();
                    }
                  }}
                />
              )}

              {/* Botón de cerrar */}
              {showCloseButton && (
                <motion.button
                  initial={{ opacity: 0, scale: 0, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}

              {/* Contenido principal */}
              <div className="relative p-16 flex flex-col items-center text-center">
                {/* Ícono principal con efectos */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.3,
                    duration: 1.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative mb-8"
                >
                  {/* Anillo visible INTERIOR (con pulso) */}
                  <motion.div
                    className="absolute inset-0 w-40 h-40 -m-4 rounded-full border"
                    style={{ borderColor: `${accentColor}80` }}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: [1, 1.03, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{
                      delay: 1.5,
                      duration: 2.5,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.6, 1],
                    }}
                  />
                  {/* Anillo visible EXTERIOR (NUEVO) */}
                  <motion.div
                    className="absolute inset-0 w-48 h-48 -m-8 rounded-full border"
                    style={{ borderColor: `${accentColor}50` }}
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{
                      delay: 1.8,
                      duration: 3,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.6, 1],
                    }}
                  />

                  {/* Glow effect MÁS SUTIL y con pulso */}
                  <motion.div
                    className="absolute inset-0 w-32 h-32 rounded-full blur-[60px]"
                    style={{ backgroundColor: accentColor }}
                    initial={{ scale: 1.6, opacity: 0 }}
                    animate={{
                      scale: [1.6, 1.7, 1.6],
                      opacity: [0.35, 0.45, 0.35],
                    }}
                    transition={{
                      delay: 1.5,
                      duration: 3,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.6, 1],
                    }}
                  />

                  {/* Círculo principal (CORREGIDO) */}
                  <motion.div
                    className="relative w-32 h-32 rounded-full flex items-center justify-center text-white"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    // ✅ Estilos aplicados correctamente como atributo 'style'
                    style={{
                      background: `
                        linear-gradient(135deg,
                          ${accentColor} 0%,
                          ${accentColor}cc 100%
                        )
                      `,
                      boxShadow: `
                        0 0 0 4px rgba(255, 255, 255, 0.15),
                        0 0 80px ${accentColor}aa,
                        0 25px 50px rgba(0, 0, 0, 0.5)
                      `,
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.7,
                        duration: 0.6,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                    >
                      {displayIcon}
                    </motion.div>
                  </motion.div>

                  {/* Sparkle decorativo AJUSTADO */}
                  <motion.div
                    initial={{ scale: 0, rotate: 0, opacity: 0 }}
                    animate={{ scale: 1, rotate: 360, opacity: 1 }}
                    transition={{
                      delay: 0.9,
                      duration: 0.8,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="absolute -top-2 -right-2"
                    style={{
                      filter: "drop-shadow(0 0 3px rgba(255,255,255,0.4))",
                    }}
                  >
                    <motion.div
                      className="p-2 rounded-full"
                      style={{
                        backgroundColor: accentColor,
                        boxShadow: `0 0 18px ${accentColor}`,
                      }}
                      initial={{ rotate: 0 }}
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        delay: 1.5,
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Título */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.8,
                    duration: 0.9,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="text-4xl font-bold text-white mb-4 tracking-tight"
                  style={{
                    textShadow: `0 0 40px ${accentColor}50, 0 4px 12px rgba(0, 0, 0, 0.6)`,
                  }}
                >
                  {displayTitle}
                </motion.h2>

                {/* Descripción */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 1,
                    duration: 0.9,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="text-white/80 text-lg font-medium max-w-md leading-relaxed"
                >
                  {displayDescription}
                </motion.p>

                {/* Línea decorativa */}
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{
                    delay: 1.2,
                    duration: 1.0,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="w-24 h-1 rounded-full mt-6"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
                    boxShadow: `0 0 20px ${accentColor}80`,
                  }}
                />

                {/* Botón de acción */}
                {autoCloseDelay === 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 1.4,
                      duration: 0.9,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="mt-10"
                  >
                    <Button
                      onClick={onClose}
                      className="relative px-10 py-3 rounded-full font-bold text-base overflow-hidden group transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: accentColor,
                        color: "white",
                        boxShadow: `
                          0 0 0 2px rgba(255, 255, 255, 0.1),
                          0 10px 40px ${accentColor}60
                        `,
                      }}
                    >
                      <span className="relative z-10">Continuar</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: "-200%" }}
                        whileHover={{ x: "200%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessScreenPremium;
