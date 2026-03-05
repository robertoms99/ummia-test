import { memo } from 'react';
import type { OA } from '@/types/oa.types';

type OAListProps = {
  items: OA[];
  loading: boolean;
  loadingMore?: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  filters: {
    asignatura?: string;
    nivel?: string;
  };
  onFilterChange: (filters: { asignatura?: string; nivel?: string }) => void;
  filterOptions: {
    asignaturas: string[];
    niveles: string[];
  };
};

export const OAList = memo(function OAList({
  items,
  loading,
  loadingMore = false,
  error,
  hasMore,
  onLoadMore,
  filters,
  onFilterChange,
  filterOptions,
}: OAListProps) {
  // Estado de carga inicial
  if (loading && items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <svg
          className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-sm text-gray-600">Cargando objetivos de aprendizaje...</p>
      </div>
    );
  }

  // Estado vacío
  if (!loading && items.length === 0 && !error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No hay objetivos de aprendizaje
        </h3>
        <p className="text-sm text-gray-500">
          {filters.asignatura || filters.nivel
            ? 'Intenta cambiar los filtros o crea un nuevo objetivo.'
            : 'Comienza creando un nuevo objetivo de aprendizaje.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filtros */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="filter-asignatura"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Asignatura
            </label>
            <select
              id="filter-asignatura"
              value={filters.asignatura || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  asignatura: e.target.value || undefined,
                })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            >
              <option value="">Todas las asignaturas</option>
              {filterOptions.asignaturas.map((asignatura) => (
                <option key={asignatura} value={asignatura}>
                  {asignatura}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-nivel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nivel
            </label>
            <select
              id="filter-nivel"
              value={filters.nivel || ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  nivel: e.target.value || undefined,
                })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
            >
              <option value="">Todos los niveles</option>
              {filterOptions.niveles.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Limpiar filtros */}
        {(filters.asignatura || filters.nivel) && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => onFilterChange({})}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Estado de error */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <span className="font-medium">Error:</span> {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de OA */}
      <div className="divide-y divide-gray-200">
        {items.map((oa) => (
          <OAListItem key={oa.id} oa={oa} />
        ))}
      </div>

      {/* Loading inline (solo cuando se carga más) */}
      {loadingMore && (
        <div className="p-4 text-center">
          <div className="inline-flex items-center">
            <svg
              className="animate-spin h-5 w-5 text-blue-600 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm text-gray-600">Cargando más...</span>
          </div>
        </div>
      )}

      {/* Botón Cargar más */}
      {!loading && !loadingMore && hasMore && items.length > 0 && (
        <div className="p-4 text-center border-t border-gray-200">
          <button
            type="button"
            onClick={onLoadMore}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cargar más
          </button>
        </div>
      )}

      {/* Sin más resultados */}
      {!loading && !loadingMore && !hasMore && items.length > 0 && (
        <div className="p-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-500">No hay más resultados</p>
        </div>
      )}
    </div>
  );
});

// Componente individual de OA (memoizado para performance)
const OAListItem = memo(function OAListItem({ oa }: { oa: OA }) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {oa.codigo}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              v{oa.version}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                oa.estado === 'ACTIVO'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {oa.estado}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">{oa.descripcion}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>
              <span className="font-medium">Asignatura:</span> {oa.asignatura}
            </span>
            <span>
              <span className="font-medium">Nivel:</span> {oa.nivel}
            </span>
            <span>
              <span className="font-medium">País:</span> {oa.pais}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Creado por {oa.createdBy} • {new Date(oa.updatedAt).toLocaleDateString('es-ES')}
          </div>
        </div>
      </div>
    </div>
  );
});
