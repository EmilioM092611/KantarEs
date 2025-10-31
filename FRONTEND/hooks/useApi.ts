// FRONTEND/hooks/useApi.ts
// Custom hook para hacer peticiones al API con manejo de estado

import { useState, useCallback } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook para hacer peticiones al API con manejo automático de estados
 *
 * @example
 * const { data, loading, error, execute } = useApi(ordenesService.getAll);
 *
 * useEffect(() => {
 *   execute({ pagina: 1, por_pagina: 10 });
 * }, []);
 */
export function useApi<T>(
  apiFunc: (...args: any[]) => Promise<T>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiFunc(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setState({ data: null, loading: false, error: errorMessage });
        return null;
      }
    },
    [apiFunc]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook para operaciones de mutación (POST, PUT, DELETE)
 * Útil para formularios y acciones que modifican datos
 *
 * @example
 * const { loading, error, execute: createOrden } = useMutation(ordenesService.create);
 *
 * const handleSubmit = async (data) => {
 *   const result = await createOrden(data);
 *   if (result) {
 *     // Éxito
 *   }
 * };
 */
export function useMutation<T>(apiFunc: (...args: any[]) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunc(...args);
        setLoading(false);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        setLoading(false);
        return null;
      }
    },
    [apiFunc]
  );

  return {
    loading,
    error,
    execute,
  };
}
