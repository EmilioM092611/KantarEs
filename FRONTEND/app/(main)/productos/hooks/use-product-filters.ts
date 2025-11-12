import { useState, useMemo } from "react";
import type { Producto } from "@/lib/api/productos";

export function useProductFilters(productos: Producto[]) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | undefined>();
  const [vista, setVista] = useState<"cards" | "table">("cards");

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      // Filtro de búsqueda
      const matchBusqueda =
        !busqueda ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku?.toLowerCase().includes(busqueda.toLowerCase());

      // Filtro de categoría
      const matchCategoria =
        !categoriaFiltro || p.categoria_id === parseInt(categoriaFiltro);

      return matchBusqueda && matchCategoria;
    });
  }, [productos, busqueda, categoriaFiltro]);

  const handleBusqueda = (value: string) => {
    setBusqueda(value);
  };

  const handleFiltroCategoria = (value: string) => {
    setCategoriaFiltro(value === "all" ? undefined : value);
  };

  const handleVista = (value: "cards" | "table") => {
    setVista(value);
  };

  const clearFilters = () => {
    setBusqueda("");
    setCategoriaFiltro(undefined);
  };

  return {
    busqueda,
    categoriaFiltro,
    vista,
    productosFiltrados,
    setBusqueda,
    setCategoriaFiltro,
    setVista,
    handleBusqueda,
    handleFiltroCategoria,
    handleVista,
    clearFilters,
  };
}
