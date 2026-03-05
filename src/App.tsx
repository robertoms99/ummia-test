// src/App.tsx
// Aplicación principal: integración de lista y formulario de OA
import { useEffect, useState } from 'react';
import { useOA } from './hooks/useOA';
import { OAList } from './components/OAList';
import { OAForm } from './components/OAForm';
import type { CreateOAInput } from './types/oa.types';

const PAISES = [
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
] as const;

function App() {
  const [paisSeleccionado, setPaisSeleccionado] = useState<string>('CL');
  const [showForm, setShowForm] = useState(false);

  const {
    items,
    loading,
    error,
    hasMore,
    load,
    loadMore,
    createOA,
    filters,
    updateFilters,
    filterOptions,
  } = useOA(paisSeleccionado);

  // Cargar datos al montar o cambiar país
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paisSeleccionado]); // Solo cuando cambie el país

  const handleCreateOA = async (data: CreateOAInput) => {
    await createOA({
      ...data,
      pais: paisSeleccionado,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                UMMIA - Objetivos de Aprendizaje
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gestión de objetivos de aprendizaje por país
              </p>
            </div>

            {/* Selector de país */}
            <div className="flex items-center gap-3">
              <label htmlFor="pais-select" className="text-sm font-medium text-gray-700">
                País:
              </label>
              <select
                id="pais-select"
                value={paisSeleccionado}
                onChange={(e) => setPaisSeleccionado(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
              >
                {PAISES.map((pais) => (
                  <option key={pais.value} value={pais.value}>
                    {pais.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Botón para mostrar/ocultar formulario */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {showForm ? 'Ocultar formulario' : 'Nuevo objetivo'}
            </button>
          </div>

          {/* Formulario de creación */}
          {showForm && (
            <OAForm
              pais={paisSeleccionado}
              onSubmit={handleCreateOA}
              onSuccess={() => {
                // Opcional: cerrar formulario después de crear
                // setShowForm(false);
              }}
            />
          )}

          {/* Estadísticas rápidas */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Objetivos cargados</p>
                <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
              </div>
              {filters.asignatura && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Filtrando por</p>
                  <p className="text-sm text-gray-900">
                    {filters.asignatura}
                    {filters.nivel && ` • ${filters.nivel}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de OA */}
          <OAList
            items={items}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            filters={filters}
            onFilterChange={updateFilters}
            filterOptions={filterOptions}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            UMMIA - Plataforma Educativa Multi-tenant • Prueba Técnica Frontend Senior
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
