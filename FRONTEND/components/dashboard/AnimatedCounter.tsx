// components/dashboard/AnimatedCounter.tsx
"use client";
import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

interface AnimatedCounterProps {
  to: number;
  isCurrency?: boolean;
  suffix?: string;
}

export function AnimatedCounter({
  to,
  isCurrency = false,
  suffix = "",
}: AnimatedCounterProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, to, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(value) {
        if (isCurrency) {
          node.textContent = new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
            maximumFractionDigits: 0,
          }).format(value);
        } else {
          node.textContent = Math.round(value).toString() + suffix;
        }
      },
    });

    return () => controls.stop();
  }, [to, isCurrency, suffix]);

  return <span ref={nodeRef} />;
}
