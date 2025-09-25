// lib/data/color-tokens.ts
import type { TokenType } from "@/lib/types/dashboard";

export const COLOR_TOKENS: Record<string, TokenType> = {
  mesas: { hexFrom: "#d31027", hexTo: "#ea384d", name: "Mesas" },
  ordenes: { hexFrom: "#0072ff", hexTo: "#00c6ff", name: "Órdenes" },
  productos: { hexFrom: "#1d976c", hexTo: "#93f9b9", name: "Productos" },
  menu: { hexFrom: "#8e2de2", hexTo: "#4a00e0", name: "Menú" },
  promociones: { hexFrom: "#e52a71", hexTo: "#f0509a", name: "Promociones" },
  inventario: { hexFrom: "#134e5e", hexTo: "#71b280", name: "Inventario" },
  compras: { hexFrom: "#f7971e", hexTo: "#ffd200", name: "Compras" },
  proveedores: { hexFrom: "#16a085", hexTo: "#1e8bc3", name: "Proveedores" },
  cortes: { hexFrom: "#ff8a00", hexTo: "#e52e71", name: "Cortes" },
  estadisticas: { hexFrom: "#fdd819", hexTo: "#e80505", name: "Estadísticas" },
  areas: { hexFrom: "#4e432e", hexTo: "#c89b40", name: "Áreas" },
  impresoras: { hexFrom: "#434343", hexTo: "#000000", name: "Impresoras" },
  usuarios: { hexFrom: "#2980b9", hexTo: "#6dd5fa", name: "Usuarios" },
  sistema: { hexFrom: "#232526", hexTo: "#414345", name: "Sistema" },
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
