import { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOAList, createOA as createOAApi } from '@/lib/api';
import type { OA, CreateOAInput } from '@/types/oa.types';

type UseOAFilters = {
  asignatura?: string;
  nivel?: string;
};

/**
 * Query keys para React Query
 */
export const oaKeys = {
  all: ['oa'] as const,
  lists: () => [...oaKeys.all, 'list'] as const,
  list: (pais: string) => [...oaKeys.lists(), pais] as const,
};

export function useOA(pais: string) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UseOAFilters>({});

  /**
   * useInfiniteQuery para paginación acumulativa
   */
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: oaKeys.list(pais),
    queryFn: ({ pageParam }) => fetchOAList(pais, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextToken ?? undefined,
    // Opciones específicas
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  /**
   * useMutation para crear OA con optimistic updates
   */
  const createMutation = useMutation({
    mutationFn: createOAApi,
    onMutate: async (newOA: CreateOAInput) => {
      await queryClient.cancelQueries({ queryKey: oaKeys.list(pais) });

      // Snapshot del estado previo
      const previousData = queryClient.getQueryData(oaKeys.list(pais));

      // Optimistic update: agregar el nuevo OA temporalmente
      const optimisticOA: OA = {
        id: `temp-${Date.now()}`,
        codigo: newOA.codigo,
        descripcion: newOA.descripcion,
        nivel: newOA.nivel,
        asignatura: newOA.asignatura,
        pais: newOA.pais,
        estado: newOA.estado || 'ACTIVO',
        version: 1,
        updatedAt: new Date().toISOString(),
        createdBy: newOA.createdBy || 'current_user',
      };

      queryClient.setQueryData(oaKeys.list(pais), (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => {
            // Agregar al principio de la primera página
            if (index === 0) {
              return {
                ...page,
                items: [optimisticOA, ...page.items],
              };
            }
            return page;
          }),
        };
      });

      return { previousData };
    },
    onError: (_err, _newOA, context) => {
      // Revertir al estado anterior en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(oaKeys.list(pais), context.previousData);
      }
    },
    onSuccess: (createdOA) => {
      // Reemplazar el OA optimista con el real del servidor
      queryClient.setQueryData(oaKeys.list(pais), (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: OA) =>
              item.id.startsWith('temp-') ? createdOA : item
            ),
          })),
        };
      });

      // NO invalidamos inmediatamente - el setQueryData ya actualizó con datos reales
      // Si queremos refetch después de un tiempo, podemos usar:
      // setTimeout(() => {
      //   queryClient.invalidateQueries({ queryKey: oaKeys.list(pais) });
      // }, 1000);
    },
  });

  /**
   * Todos los items acumulados de todas las páginas
   */
  const allItems = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data?.pages]);

  /**
   * Obtener solo la última versión ACTIVA por código
   */
  const getLatestActiveVersions = useMemo(() => {
    const grouped = new Map<string, OA[]>();

    allItems.forEach((item) => {
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
  }, [allItems]);

  /**
   * Items filtrados (valor derivado)
   */
  const items = useMemo(() => {
    let result = getLatestActiveVersions;

    if (filters.asignatura) {
      result = result.filter((item) => item.asignatura === filters.asignatura);
    }

    if (filters.nivel) {
      result = result.filter((item) => item.nivel === filters.nivel);
    }

    return result;
  }, [getLatestActiveVersions, filters]);

  /**
   * Opciones para filtros (basado en últimas versiones activas)
   */
  const filterOptions = useMemo(() => {
    return {
      asignaturas: Array.from(
        new Set(getLatestActiveVersions.map((item) => item.asignatura))
      ).sort(),
      niveles: Array.from(
        new Set(getLatestActiveVersions.map((item) => item.nivel))
      ).sort(),
    };
  }, [getLatestActiveVersions]);

  /**
   * Función para crear OA
   */
  const createOA = async (input: CreateOAInput) => {
    if (input.pais !== pais) {
      throw new Error('El país del OA no coincide con el país seleccionado');
    }
    return createMutation.mutateAsync(input);
  };

  /**
   * Actualizar filtros
   */
  const updateFilters = (newFilters: UseOAFilters) => {
    setFilters(newFilters);
  };

  /**
   * Reset (limpiar cache y filtros)
   */
  const reset = () => {
    setFilters({});
    queryClient.removeQueries({ queryKey: oaKeys.list(pais) });
  };

  return {
    // Datos
    items,
    allItems,

    // Estados
    loading: isLoading,
    loadingMore: isFetchingNextPage,
    error: error ? (error as Error).message : null,

    // Paginación
    hasMore: hasNextPage ?? false,
    loadMore: fetchNextPage,

    // Acciones
    refetch,
    reset,
    createOA,

    // Filtros
    filters,
    updateFilters,
    filterOptions,

    // Estados de mutación
    isCreating: createMutation.isPending,
    createError: createMutation.error?.message,
  };
}
