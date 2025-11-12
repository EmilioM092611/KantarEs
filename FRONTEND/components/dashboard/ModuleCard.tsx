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

  // Motion values para leve parallax
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const mpX = useMotionValue(0);
  const mpY = useMotionValue(0);

  // Parallax del icono grande de fondo
  const rotateX = useTransform(mvY, [-0.5, 0.5], [-12, 12]);
  const rotateY = useTransform(mvX, [-0.5, 0.5], [12, -12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mvX.set(x);
    mvY.set(y);
    mpX.set(e.clientX - rect.left);
    mpY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mvX.set(0);
    mvY.set(0);
  };

  // Variables CSS (para gradientes y glow)
  const cssVars = {
    "--from": token.hexFrom,
    "--to": token.hexTo,
    "--glow": `0 14px 60px ${token.hexFrom}33, 0 8px 26px -8px ${token.hexTo}55, inset 0 0 80px ${token.hexTo}33`,
  } as React.CSSProperties;

  return (
    <motion.div
      ref={cardRef}
      style={cssVars}
      className="relative rounded-3xl overflow-hidden cursor-pointer group h-full transform-gpu will-change-transform"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover="hover"
      onClick={() => onActivate(module)}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
    >
      {/* Glow sutil (barato) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "var(--glow)" }}
      />

      {/* Fondo gradiente principal */}
      <motion.div
        variants={{ hover: { scale: 1.03 } }}
        className="absolute inset-0 bg-[linear-gradient(135deg,var(--from),var(--to))]"
      />

      {/* Capa oscura + blur solo en md+ para bajar costo en móviles */}
      <div className="absolute inset-0 bg-black/15 md:backdrop-blur-sm" />

      {/* Spotlight de hover (ligero, sin filtros caros) */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useTransform(
            [mpX, mpY],
            ([x, y]) =>
              `radial-gradient(380px circle at ${x}px ${y}px, rgba(255,255,255,0.22), transparent 65%)`
          ),
        }}
      />

      {/* Icono gigante de fondo con leve parallax */}
      <motion.div
        style={{ translateX: rotateY, translateY: rotateX }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="absolute -right-8 -top-8 opacity-10 pointer-events-none"
      >
        <module.icon className="w-36 h-36 text-white" />
      </motion.div>

      <Card className="relative bg-transparent shadow-none border-0 h-full">
        <CardContent className="p-6 h-full flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center transform-gpu will-change-transform">
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <motion.h3
                    variants={{ hover: { y: -4 } }}
                    className="text-white text-xl font-bold drop-shadow-md"
                  >
                    {module.title}
                  </motion.h3>
                  <motion.p
                    variants={{ hover: { y: -1 } }}
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

          {/* CTA */}
          <motion.div className="mt-4 relative rounded-lg" whileHover="hover">
            <Button
              tabIndex={-1}
              className="w-full transform-gpu bg-white/10 border border-white/20 backdrop-blur-sm focus:outline-none relative overflow-hidden"
            >
              Abrir
            </Button>

            {/* Sheen del botón (transform-only) */}
            <motion.span
              className="absolute top-0 left-0 w-1/2 h-full bg-[linear-gradient(to_right,transparent,white,transparent)] opacity-20"
              variants={{ hover: { x: "150%", transition: { duration: 0.6 } } }}
              initial={{ x: "-150%" }}
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
