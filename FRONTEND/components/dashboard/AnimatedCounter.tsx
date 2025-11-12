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
    if (!nodeRef.current) return;

    const node = nodeRef.current;

    const controls = animate(0, to, {
      duration: 1.0, // antes 1.5 -> más ágil
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
