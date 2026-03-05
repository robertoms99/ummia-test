// src/hooks/useOA.ts
// Hook personalizado para manejar Objetivos de Aprendizaje con paginación acumulativa
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { graphqlRequest, LIST_OA_QUERY, CREATE_OA_MUTATION } from '@/lib/graphql-client';
import type {
  OA,
  ListOAResult,
  CreateOAInput,
  ListOAVariables,
  CreateOAVariables,
} from '@/types/oa.types';

type UseOAFilters = {
  asignatura?: string;
  nivel?: string;
};

export function useOA(pais: string) {
  const [allItems, setAllItems] = useState<OA[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseOAFilters>({});
  
  const isFetchingRef = useRef(false);

  // Resetear cuando cambia el país
  useEffect(() => {
    setAllItems([]);
    setNextToken(null);
    setFilters({});
    setError(null);
    isFetchingRef.current = false;
  }, [pais]);

  /**
   * Obtener solo la última versión ACTIVA por código
   */
  const getLatestActiveVersions = useCallback((items: OA[]): OA[] => {
    const grouped = new Map<string, OA[]>();

    items.forEach((item) => {
      const existing = grouped.get(item.codigo) || [];
      grouped.set(item.codigo, [...existing, item]);
    });

    const result: OA[] = [];
    grouped.forEach((versions) => {
      const activeVersions = versions
        .filter((v) => v.estado === 'ACTIVO')
        .sort((a, b) => b.version - a.version);

      if (activeVersions.length > 0) {
        result.push(activeVersions[0]);
      }
    });

    return result;
  }, []);

  /**
   * Items filtrados (valor derivado)
   */
  const items = useMemo(() => {
    let result = getLatestActiveVersions(allItems);

    if (filters.asignatura) {
      result = result.filter((item) => item.asignatura === filters.asignatura);
    }

    if (filters.nivel) {
      result = result.filter((item) => item.nivel === filters.nivel);
    }

    return result;
  }, [allItems, filters, getLatestActiveVersions]);

  /**
   * Opciones para filtros
   */
  const filterOptions = useMemo(() => {
    const latestActive = getLatestActiveVersions(allItems);
    
    return {
      asignaturas: Array.from(new Set(latestActive.map((item) => item.asignatura))).sort(),
      niveles: Array.from(new Set(latestActive.map((item) => item.nivel))).sort(),
    };
  }, [allItems, getLatestActiveVersions]);

  /**
   * Cargar datos
   */
  const load = useCallback(async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    setAllItems([]);
    setNextToken(null);

    try {
      const response = await graphqlRequest<{ listOA: ListOAResult }>(
        LIST_OA_QUERY,
        { pais, nextToken: null }
      );

      setAllItems(response.listOA.items);
      setNextToken(response.listOA.nextToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [pais]);

  /**
   * Cargar más (paginación)
   */
  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !nextToken || loading) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await graphqlRequest<{ listOA: ListOAResult }>(
        LIST_OA_QUERY,
        { pais, nextToken }
      );

      setAllItems((prev) => [...prev, ...response.listOA.items]);
      setNextToken(response.listOA.nextToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar más datos');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [pais, nextToken, loading]);

  /**
   * Refetch
   */
  const refetch = useCallback(() => {
    load();
  }, [load]);

  /**
   * Reset
   */
  const reset = useCallback(() => {
    setAllItems([]);
    setNextToken(null);
    setFilters({});
    setError(null);
    setLoading(false);
    isFetchingRef.current = false;
  }, []);

  /**
   * Crear OA con optimistic update
   */
  const createOA = useCallback(
    async (input: CreateOAInput) => {
      if (input.pais !== pais) {
        throw new Error('El país del OA no coincide con el país seleccionado');
      }

      const optimisticOA: OA = {
        id: `temp-${Date.now()}`,
        codigo: input.codigo,
        descripcion: input.descripcion,
        nivel: input.nivel,
        asignatura: input.asignatura,
        pais: input.pais,
        estado: input.estado || 'ACTIVO',
        version: 1,
        updatedAt: new Date().toISOString(),
        createdBy: input.createdBy || 'current_user',
      };

      setAllItems((prev) => [optimisticOA, ...prev]);

      try {
        const response = await graphqlRequest<{ createOA: OA }>(
          CREATE_OA_MUTATION,
          { input }
        );

        setAllItems((prev) =>
          prev.map((item) => (item.id === optimisticOA.id ? response.createOA : item))
        );

        return response.createOA;
      } catch (err) {
        setAllItems((prev) => prev.filter((item) => item.id !== optimisticOA.id));
        throw err;
      }
    },
    [pais]
  );

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters: UseOAFilters) => {
    setFilters(newFilters);
  }, []);

  return {
    items,
    allItems,
    loading,
    error,
    hasMore: nextToken !== null,
    load,
    loadMore,
    refetch,
    reset,
    createOA,
    filters,
    updateFilters,
    filterOptions,
  };
}
