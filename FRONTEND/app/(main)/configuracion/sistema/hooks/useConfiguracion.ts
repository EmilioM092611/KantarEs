// app/(dashboard)/sistema/hooks/useConfiguracion.ts
// Hook personalizado para manejar toda la lógica de configuración

import { useState, useEffect } from "react";
import { configuracionService } from "@/lib/api/configuracion";
import type {
  ConfiguracionGeneral,
  ConfiguracionOperativa,
  ConfiguracionFiscal,
  ConfiguracionFolios,
  ConfiguracionAlertas,
  ConfiguracionTurnos,
  Turno,
} from "@/lib/api/configuracion";
import { useToast } from "@/hooks/use-toast";

export type SeccionConfiguracion =
  | "general"
  | "operativa"
  | "fiscal"
  | "folios"
  | "alertas"
  | "turnos";

export const useConfiguracion = () => {
  const { toast } = useToast();

  // Estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SeccionConfiguracion>("general");

  // Estados de configuración
  const [general, setGeneral] = useState<ConfiguracionGeneral | null>(null);
  const [operativa, setOperativa] = useState<ConfiguracionOperativa | null>(
    null
  );
  const [fiscal, setFiscal] = useState<ConfiguracionFiscal | null>(null);
  const [folios, setFolios] = useState<ConfiguracionFolios | null>(null);
  const [alertas, setAlertas] = useState<ConfiguracionAlertas | null>(null);
  const [turnos, setTurnos] = useState<ConfiguracionTurnos | null>(null);

  // Cargar configuraciones al montar
  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  /**
   * Cargar todas las configuraciones desde el backend
   */
  const cargarConfiguraciones = async () => {
    try {
      setIsLoading(true);
      const todas = await configuracionService.obtenerTodas();

      setGeneral(todas.general);
      setOperativa(todas.operativa);
      setFiscal(todas.fiscal);
      setFolios(todas.folios);
      setAlertas(todas.alertas);
      setTurnos(todas.turnos);
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error al cargar configuraciones",
        description: error.message || "Ocurrió un error inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Guardar configuración de la sección activa
   */
  const guardarConfiguracion = async () => {
    try {
      setIsSaving(true);

      switch (activeTab) {
        case "general":
          if (general) {
            await configuracionService.actualizarGeneral(general);
          }
          break;
        case "operativa":
          if (operativa) {
            await configuracionService.actualizarOperativa(operativa);
          }
          break;
        case "fiscal":
          if (fiscal) {
            await configuracionService.actualizarFiscal(fiscal);
          }
          break;
        case "folios":
          if (folios) {
            await configuracionService.actualizarFolios(folios);
          }
          break;
        case "alertas":
          if (alertas) {
            await configuracionService.actualizarAlertas(alertas);
          }
          break;
        case "turnos":
          if (turnos) {
            // Validar que todos los turnos tengan al menos un día
            const turnosSinDias = turnos.turnos.filter(
              (t) => t.dias_semana.length === 0
            );
            if (turnosSinDias.length > 0) {
              toast({
                variant: "error",
                title: "Error de validación",
                description:
                  "Todos los turnos deben tener al menos un día seleccionado",
              });
              setIsSaving(false);
              return;
            }
            await configuracionService.actualizarTurnos(turnos);
          }
          break;
      }

      toast({
        variant: "success",
        title: "Configuración guardada",
        description: "Los cambios se han guardado exitosamente",
      });
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error al guardar",
        description: error.message || "No se pudieron guardar los cambios",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Restaurar todas las configuraciones a valores por defecto
   */
  const restaurarDefaults = async () => {
    if (
      !confirm(
        "⚠️ ¿Estás seguro de restaurar todas las configuraciones a sus valores por defecto? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      setIsSaving(true);
      await configuracionService.restaurarDefaults();
      await cargarConfiguraciones();

      toast({
        variant: "success",
        title: "Configuraciones restauradas",
        description: "Todos los valores han sido restaurados por defecto",
      });
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error al restaurar",
        description:
          error.message || "No se pudieron restaurar las configuraciones",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Limpiar caché de configuración
   */
  const limpiarCache = async () => {
    try {
      await configuracionService.limpiarCache();
      toast({
        variant: "success",
        title: "Caché limpiado",
        description: "El caché de configuración se ha limpiado exitosamente",
      });
    } catch (error: any) {
      toast({
        variant: "error",
        title: "Error al limpiar caché",
        description: error.message || "No se pudo limpiar el caché",
      });
    }
  };

  /**
   * Agregar nuevo turno
   */
  const agregarTurno = () => {
    if (!turnos) return;

    const nuevoTurno: Turno = {
      nombre: "Nuevo Turno",
      hora_inicio: "00:00",
      hora_fin: "00:00",
      dias_semana: [],
      requiere_corte: false,
      activo: true,
    };

    setTurnos({
      ...turnos,
      turnos: [...turnos.turnos, nuevoTurno],
    });

    toast({
      variant: "info",
      title: "Turno agregado",
      description: "Configura el nuevo turno y guarda los cambios",
    });
  };

  /**
   * Eliminar turno por índice
   */
  const eliminarTurno = (index: number) => {
    if (!turnos) return;

    if (turnos.turnos.length === 1) {
      toast({
        variant: "error",
        title: "No se puede eliminar",
        description: "Debe existir al menos un turno",
      });
      return;
    }

    if (!confirm("¿Estás seguro de eliminar este turno?")) {
      return;
    }

    const nuevosTurnos = turnos.turnos.filter((_, i) => i !== index);
    setTurnos({ ...turnos, turnos: nuevosTurnos });

    toast({
      variant: "info",
      title: "Turno eliminado",
      description: "No olvides guardar los cambios",
    });
  };

  return {
    // Estados
    isLoading,
    isSaving,
    activeTab,
    general,
    operativa,
    fiscal,
    folios,
    alertas,
    turnos,

    // Setters
    setActiveTab,
    setGeneral,
    setOperativa,
    setFiscal,
    setFolios,
    setAlertas,
    setTurnos,

    // Acciones
    cargarConfiguraciones,
    guardarConfiguracion,
    restaurarDefaults,
    limpiarCache,
    agregarTurno,
    eliminarTurno,
  };
};
