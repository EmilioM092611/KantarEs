// components/dashboard/ModuleCard.tsx
"use client";
import React, { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ModuleType, TokenType } from "@/lib/types/dashboard";

interface ModuleCardProps {
  module: ModuleType;
  token: TokenType;
  onActivate: (module: ModuleType) => void;
}

export function ModuleCard({ module, token, onActivate }: ModuleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mousePosition = { x: useMotionValue(0), y: useMotionValue(0) };

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [-12, 12]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [12, -12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    mousePosition.x.set(e.clientX - rect.left);
    mousePosition.y.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const cssVariables = {
    "--color-from": token.hexFrom,
    "--color-to": token.hexTo,
    "--glow-shadow": `0 14px 60px ${token.hexFrom}33, inset 0 0 100px ${token.hexTo}55`,
    "--icon-color": "#FFFFFF",
  } as React.CSSProperties;

  // MEJORA: `layoutId` añadido para la Transición de Diseño Compartido
  return (
    <motion.div
      layoutId={`module-card-${module.key}`}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onActivate(module)}
      style={{
        ...cssVariables,
        transformStyle: "preserve-3d",
        perspective: "900px",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover="hover"
      className="relative rounded-3xl overflow-hidden cursor-pointer group h-full"
    >
      <motion.div
        variants={{ hover: { scale: 1.035 } }}
        className="relative z-10 h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{ boxShadow: "var(--glow-shadow)" }}
        />

        {/* MEJORA: Hover Invertido (spotlight) */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform(
              [mousePosition.x, mousePosition.y],
              ([x, y]) =>
                `radial-gradient(400px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.25), transparent)`
            ),
          }}
        />

        <motion.div
          variants={{ hover: { scale: 1.06, filter: "brightness(1.05)" } }}
          className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-from),var(--color-to))]"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        <motion.div
          style={{ translateX: rotateY, translateY: rotateX }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute -right-8 -top-8 opacity-10 pointer-events-none"
        >
          <module.icon className="w-36 h-36 text-white/10" />
        </motion.div>
        <Card className="relative bg-transparent shadow-none border-0 h-full">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    style={{
                      transformStyle: "preserve-3d",
                      translateX: useTransform(rotateY, (v) => v * 0.4),
                      translateY: useTransform(rotateX, (v) => v * 0.4),
                    }}
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] border border-white/10"
                  >
                    <motion.div variants={{ hover: { scale: 1.1, rotate: 5 } }}>
                      <module.icon
                        className="w-7 h-7 drop-shadow-xl"
                        style={{ color: "var(--icon-color)" }}
                      />
                    </motion.div>
                  </motion.div>
                  <div>
                    <motion.h3
                      variants={{ hover: { y: -6 } }}
                      className="text-white text-xl font-bold drop-shadow-md"
                    >
                      {module.title}
                    </motion.h3>
                    <motion.p
                      variants={{ hover: { y: -2 } }}
                      className="text-white/90 text-sm mt-1"
                    >
                      {module.description}
                    </motion.p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 z-20">
                  <Badge className="bg-black/30 border-white/10 text-white text-xs">
                    {module.category}
                  </Badge>
                </div>
              </div>
            </div>
            <motion.div className="mt-4 relative rounded-lg" whileHover="hover">
              <Button
                tabIndex={-1}
                className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm focus:outline-none relative overflow-hidden"
              >
                Abrir
              </Button>
              <motion.span
                className="absolute top-0 left-0 w-1/2 h-full bg-[linear-gradient(to_right,transparent,white,transparent)] opacity-20"
                variants={{
                  hover: { x: "150%", transition: { duration: 0.6 } },
                }}
                initial={{ x: "-150%" }}
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
