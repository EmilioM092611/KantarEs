import { useState, useEffect, useCallback } from "react";
import { unidadesMedidaService, UnidadMedida } from "@/lib/api/unidades-medida";

export function useUnidadesMedida() {
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UnidadMedida | null>(null);

  const cargarUnidades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await unidadesMedidaService.obtenerUnidades();
      setUnidadesMedida(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar unidades de medida");
      console.error("Error al cargar unidades:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUnidades();
  }, [cargarUnidades]);

  const crearUnidad = async (data: Partial<UnidadMedida>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await unidadesMedidaService.crearUnidad(data as any);
      await cargarUnidades();
      setModalOpen(false);
      setEditing(null);
    } catch (err: any) {
      setError(err.message || "Error al crear unidad");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizarUnidad = async (
    id: number,
    data: Partial<UnidadMedida>
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await unidadesMedidaService.actualizarUnidad(id, data as any);
      await cargarUnidades();
      setModalOpen(false);
      setEditing(null);
    } catch (err: any) {
      setError(err.message || "Error al actualizar unidad");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarUnidad = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await unidadesMedidaService.eliminarUnidad(id);
      await cargarUnidades();
    } catch (err: any) {
      setError(err.message || "Error al eliminar unidad");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const guardarUnidad = async (data: Partial<UnidadMedida>): Promise<void> => {
    if (editing) {
      await actualizarUnidad(editing.id, data);
    } else {
      await crearUnidad(data);
    }
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (unidad: UnidadMedida) => {
    setEditing(unidad);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return {
    unidadesMedida,
    loading,
    error,
    modalOpen,
    editing,
    setModalOpen,
    cargarUnidades,
    crearUnidad,
    actualizarUnidad,
    eliminarUnidad,
    guardarUnidad,
    openNew,
    openEdit,
    closeModal,
  };
}
