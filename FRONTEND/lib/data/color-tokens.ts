// lib/data/color-tokens.ts
import type { TokenType } from "@/lib/types/dashboard";

export const COLOR_TOKENS: Record<string, TokenType> = {
  // --- Módulos que YA TE GUSTAN (Sin cambios) ---
  mesas: { hexFrom: "#d31027", hexTo: "#ea384d", name: "Mesas" },
  ordenes: { hexFrom: "#0072ff", hexTo: "#00c6ff", name: "Órdenes" },
  inventario: { hexFrom: "#1488CC", hexTo: "#2B32B2", name: "Inventario" },
  compras: { hexFrom: "#005C97", hexTo: "#363795", name: "Compras" },
  proveedores: { hexFrom: "#00C9FF", hexTo: "#92FE9D", name: "Proveedores" },
  cortes: { hexFrom: "#485563", hexTo: "#29323C", name: "Cortes" },
  estadisticas: { hexFrom: "#1F4037", hexTo: "#99F2C8", name: "Estadísticas" },
  reportes: { hexFrom: "#0575E6", hexTo: "#021B79", name: "Reportes" },
  impresoras: { hexFrom: "#434343", hexTo: "#000000", name: "Impresoras" },
  usuarios: { hexFrom: "#2980b9", hexTo: "#6dd5fa", name: "Usuarios" },
  sistema: { hexFrom: "#232526", hexTo: "#414345", name: "Sistema" },
  areas: { hexFrom: "#8e9eab", hexTo: "#eef2f3", name: "Áreas" },

  // --- Módulos con la selección FINAL de colores ---

  // Productos: Paleta "Neón y Joya"
  productos: { hexFrom: "#0F2027", hexTo: "#2C5364", name: "Productos" }, // Azul zafiro oscuro
  menu: { hexFrom: "#C04848", hexTo: "#480048", name: "Menú" }, // Fucsia a amatista
  promociones: { hexFrom: "#13f1fc", hexTo: "#0474b3", name: "Promociones" }, // Turquesa neón

  // --- Métricas (SIN CAMBIOS, como pediste) ---
  mesasMetric: { hexFrom: "#cb2d3e", hexTo: "#ef473a", name: "Mesas Metric" },
  pedidosMetric: {
    hexFrom: "#00b09b",
    hexTo: "#96c93d",
    name: "Pedidos Metric",
  },
  ventasMetric: { hexFrom: "#f2994a", hexTo: "#f2c94c", name: "Ventas Metric" },
  personalMetric: {
    hexFrom: "#2575fc",
    hexTo: "#6a11cb",
    name: "Personal Metric",
  },
};
