// FRONTEND/hooks/use-productos.ts

import { useState, useEffect, useCallback } from "react";
import {
  productosService,
  Producto,
  QueryProductosDto,
} from "@/lib/api/productos";
import { categoriasService, Categoria } from "@/lib/api/categorias";
import { unidadesMedidaService, UnidadMedida } from "@/lib/api/unidades-medida";

interface UseProductosOptions {
  autoLoad?: boolean;
  initialQuery?: QueryProductosDto;
}

interface UseProductosReturn {
  // Estado
  productos: Producto[];
  categorias: Categoria[];
  unidadesMedida: UnidadMedida[];
  loading: boolean;
  error: string | null;

  // Paginación
  page: number;
  totalPages: number;
  setPage: (page: number) => void;

  // Filtros
  query: QueryProductosDto;
  setQuery: (query: QueryProductosDto) => void;

  // Acciones CRUD
  cargarProductos: () => Promise<void>;
  crearProducto: (data: Partial<Producto>) => Promise<Producto>;
  actualizarProducto: (
    id: number,
    data: Partial<Producto>
  ) => Promise<Producto>;
  eliminarProducto: (id: number) => Promise<void>;
  duplicarProducto: (id: number) => Promise<Producto>;
  toggleDisponibilidad: (id: number) => Promise<void>;

  // Utilidades
  obtenerProducto: (id: number) => Promise<Producto>;
  buscarProductos: (searchTerm: string) => Promise<Producto[]>;
}

export function useProductos(
  options: UseProductosOptions = {}
): UseProductosReturn {
  const { autoLoad = true, initialQuery = {} } = options;

  // Estados
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialQuery.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState<QueryProductosDto>(initialQuery);

  // Cargar datos iniciales (categorías y unidades de medida)
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const [cats, unidades] = await Promise.all([
          categoriasService.obtenerCategoriasActivas(),
          unidadesMedidaService.obtenerUnidades(),
        ]);
        setCategorias(cats);
        setUnidadesMedida(unidades);
      } catch (err: any) {
        console.error("Error al cargar datos iniciales:", err);
      }
    };

    cargarDatosIniciales();
  }, []);

  // Cargar productos
  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { productos: data, meta } = await productosService.obtenerProductos(
        {
          ...query,
          page,
        }
      );

      setProductos(data);
      setTotalPages(meta.totalPages);
    } catch (err: any) {
      setError(err.message || "Error al cargar productos");
      console.error("Error al cargar productos:", err);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  // Autoload
  useEffect(() => {
    if (autoLoad) {
      cargarProductos();
    }
  }, [autoLoad, cargarProductos]);

  // Crear producto
  const crearProducto = async (data: Partial<Producto>): Promise<Producto> => {
    try {
      setLoading(true);
      setError(null);
      const nuevoProducto = await productosService.crearProducto(data);
      await cargarProductos(); // Recargar lista
      return nuevoProducto;
    } catch (err: any) {
      setError(err.message || "Error al crear producto");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar producto
  const actualizarProducto = async (
    id: number,
    data: Partial<Producto>
  ): Promise<Producto> => {
    try {
      setLoading(true);
      setError(null);
      const productoActualizado = await productosService.actualizarProducto(
        id,
        data
      );
      await cargarProductos(); // Recargar lista
      return productoActualizado;
    } catch (err: any) {
      setError(err.message || "Error al actualizar producto");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const eliminarProducto = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await productosService.eliminarProducto(id);
      await cargarProductos(); // Recargar lista
    } catch (err: any) {
      setError(err.message || "Error al eliminar producto");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Duplicar producto
  const duplicarProducto = async (id: number): Promise<Producto> => {
    try {
      setLoading(true);
      setError(null);
      const productoDuplicado = await productosService.duplicarProducto(id);
      await cargarProductos(); // Recargar lista
      return productoDuplicado;
    } catch (err: any) {
      setError(err.message || "Error al duplicar producto");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle disponibilidad
  const toggleDisponibilidad = async (id: number): Promise<void> => {
    try {
      const producto = productos.find((p) => p.id === id);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      setError(null);
      await productosService.toggleDisponibilidad(id, !producto.disponible);
      await cargarProductos(); // Recargar lista
    } catch (err: any) {
      setError(err.message || "Error al cambiar disponibilidad");
      throw err;
    }
  };

  // Obtener producto por ID
  const obtenerProducto = async (id: number): Promise<Producto> => {
    try {
      setError(null);
      return await productosService.obtenerProducto(id);
    } catch (err: any) {
      setError(err.message || "Error al obtener producto");
      throw err;
    }
  };

  // Buscar productos
  const buscarProductos = async (searchTerm: string): Promise<Producto[]> => {
    try {
      setError(null);
      return await productosService.buscarProductos(searchTerm);
    } catch (err: any) {
      setError(err.message || "Error al buscar productos");
      throw err;
    }
  };

  return {
    // Estado
    productos,
    categorias,
    unidadesMedida,
    loading,
    error,

    // Paginación
    page,
    totalPages,
    setPage,

    // Filtros
    query,
    setQuery,

    // Acciones
    cargarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    duplicarProducto,
    toggleDisponibilidad,

    // Utilidades
    obtenerProducto,
    buscarProductos,
  };
}
