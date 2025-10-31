"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================
// TIPOS Y CONFIGURACIONES
// ============================================

type SuccessVariant = "create" | "edit" | "delete" | "custom";

interface SuccessScreenProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: SuccessVariant;
  title?: string;
  description?: string;
  autoCloseDelay?: number; // Cerrar automáticamente después de X ms (0 = no auto cerrar)
  showCloseButton?: boolean;
  icon?: React.ReactNode;
  accentColor?: string; // Color principal (default: red-500)
}

// ============================================
// COMPONENTE DE PARTÍCULAS/CONFETTI
// ============================================

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

const ConfettiParticles: React.FC<{ accentColor: string }> = ({
  accentColor,
}) => {
  const [particles] = useState<Particle[]>(() => {
    // Generar partículas aleatorias
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      color: [accentColor, "white", "yellow", "blue", "purple"][
        Math.floor(Math.random() * 5)
      ],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.3,
    }));
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full`}
          style={{
            width: particle.size,
            height: particle.size,
            left: "50%",
            top: "50%",
            backgroundColor: particle.color,
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: particle.x * 5,
            y: particle.y * 5,
            opacity: 0,
            scale: 1,
            rotate: particle.rotation,
          }}
          transition={{
            duration: 1.5,
            delay: particle.delay,
            ease: [0.32, 0.72, 0, 1],
          }}
        />
      ))}
    </div>
  );
};

// ============================================
// COMPONENTE DE ONDAS EXPANSIVAS
// ============================================

const RippleEffect: React.FC<{ accentColor: string }> = ({ accentColor }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full border-2`}
          style={{
            borderColor: accentColor,
          }}
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{
            width: 300,
            height: 300,
            opacity: 0,
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.2,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  isOpen,
  onClose,
  variant = "create",
  title,
  description,
  autoCloseDelay = 3000,
  showCloseButton = true,
  icon,
  accentColor = "rgb(239, 68, 68)", // red-500 por defecto
}) => {
  const [progress, setProgress] = useState(100);

  // Configuración por variante
  const variantConfig = {
    create: {
      title: "¡Creado Exitosamente!",
      description: "El registro ha sido creado correctamente.",
      icon: <Check className="w-12 h-12" />,
    },
    edit: {
      title: "¡Actualizado Exitosamente!",
      description: "Los cambios han sido guardados correctamente.",
      icon: <Check className="w-12 h-12" />,
    },
    delete: {
      title: "¡Eliminado Exitosamente!",
      description: "El registro ha sido eliminado correctamente.",
      icon: <Check className="w-12 h-12" />,
    },
    custom: {
      title: title || "¡Operación Exitosa!",
      description: description || "La operación se completó correctamente.",
      icon: icon || <Check className="w-12 h-12" />,
    },
  };

  const config = variantConfig[variant];
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayIcon = icon || config.icon;

  // Auto-cierre con barra de progreso
  useEffect(() => {
    if (!isOpen || autoCloseDelay === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (autoCloseDelay / 50);
        if (newProgress <= 0) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => {
      clearInterval(interval);
      setProgress(100);
    };
  }, [isOpen, autoCloseDelay, onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Backdrop con blur */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(12px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            className="absolute inset-0 bg-black/60"
          />

          {/* Efectos de fondo */}
          <RippleEffect accentColor={accentColor} />

          {/* Contenedor principal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="relative w-full max-w-md"
          >
            {/* Card con Glassmorphism */}
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              {/* Gradient superior */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                }}
              />

              {/* Barra de progreso auto-cierre */}
              {autoCloseDelay > 0 && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-white/30"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.05 }}
                />
              )}

              {/* Botón de cerrar */}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}

              {/* Contenido */}
              <div className="relative p-12 flex flex-col items-center text-center">
                {/* Partículas de confetti */}
                <ConfettiParticles accentColor={accentColor} />

                {/* Ícono principal con animación */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 15,
                    stiffness: 200,
                    delay: 0.2,
                  }}
                  className="relative mb-8"
                >
                  {/* Círculo de fondo con glow */}
                  <div
                    className="absolute inset-0 rounded-full blur-2xl opacity-40"
                    style={{
                      backgroundColor: accentColor,
                      transform: "scale(1.5)",
                    }}
                  />

                  {/* Círculo principal */}
                  <div
                    className="relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl"
                    style={{
                      backgroundColor: accentColor,
                    }}
                  >
                    {displayIcon}
                  </div>

                  {/* Sparkles animados */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles
                      className="w-6 h-6 text-yellow-300"
                      fill="currentColor"
                    />
                  </motion.div>
                </motion.div>

                {/* Título */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-3xl font-bold text-white mb-3 tracking-tight"
                >
                  {displayTitle}
                </motion.h2>

                {/* Descripción */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-white/70 text-base font-medium max-w-sm"
                >
                  {displayDescription}
                </motion.p>

                {/* Botón de acción (opcional) */}
                {autoCloseDelay === 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-8"
                  >
                    <Button
                      onClick={onClose}
                      className="px-8 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                      style={{
                        backgroundColor: accentColor,
                        color: "white",
                      }}
                    >
                      Continuar
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

export default SuccessScreen;
