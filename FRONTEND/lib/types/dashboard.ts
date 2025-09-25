// lib/types/dashboard.ts
import type { LucideIcon } from "lucide-react";

export type ModuleType = {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon; // Usamos el tipo específico de Lucide para mayor claridad
  tokenKey: string;
  category: string;
  href: string;
};

export type TokenType = {
  hexFrom: string;
  hexTo: string;
  name: string;
};
