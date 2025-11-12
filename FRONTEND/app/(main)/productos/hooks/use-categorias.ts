import { useState, useEffect, useCallback } from "react";
import { categoriasService, Categoria } from "@/lib/api/categorias";

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);

  const cargarCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriasService.obtenerCategoriasActivas();
      setCategorias(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar categorías");
      console.error("Error al cargar categorías:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const crearCategoria = async (data: Partial<Categoria>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await categoriasService.crearCategoria(data as any);
      await cargarCategorias();
      setModalOpen(false);
      setEditing(null);
    } catch (err: any) {
      setError(err.message || "Error al crear categoría");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarCategoria = async (
    id: number,
    data: Partial<Categoria>
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await categoriasService.actualizarCategoria(id, data as any);
      await cargarCategorias();
      setModalOpen(false);
      setEditing(null);
    } catch (err: any) {
      setError(err.message || "Error al actualizar categoría");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarCategoria = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await categoriasService.eliminarCategoria(id);
      await cargarCategorias();
    } catch (err: any) {
      setError(err.message || "Error al eliminar categoría");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const guardarCategoria = async (data: Partial<Categoria>): Promise<void> => {
    if (editing) {
      await actualizarCategoria(editing.id, data);
    } else {
      await crearCategoria(data);
    }
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (categoria: Categoria) => {
    setEditing(categoria);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return {
    categorias,
    loading,
    error,
    modalOpen,
    editing,
    setModalOpen,
    cargarCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    guardarCategoria,
    openNew,
    openEdit,
    closeModal,
  };
}
