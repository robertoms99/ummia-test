// src/components/OAForm.tsx
// Formulario de creación de OA con validaciones robustas y optimistic updates
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOASchema, type CreateOAFormData } from '@/schemas/oa.schema';

type OAFormProps = {
  pais: string;
  onSubmit: (data: CreateOAFormData) => Promise<void>;
  onSuccess?: () => void;
};

export function OAForm({ pais, onSubmit, onSuccess }: OAFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOAFormData>({
    resolver: zodResolver(createOASchema),
    defaultValues: {
      codigo: '',
      descripcion: '',
      nivel: '',
      asignatura: '',
      estado: 'ACTIVO',
    },
  });

  const onSubmitForm = async (data: CreateOAFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await onSubmit(data);
      setSubmitSuccess(true);
      reset();
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSubmitSuccess(false), 3000);
      
      onSuccess?.();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error al crear OA');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Crear Objetivo de Aprendizaje
      </h2>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        {/* País (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            País
          </label>
          <input
            type="text"
            value={pais}
            disabled
            className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm px-3 py-2 border text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            El OA se creará para el país seleccionado
          </p>
        </div>

        {/* Código */}
        <div>
          <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
            Código <span className="text-red-500">*</span>
          </label>
          <input
            {...register('codigo')}
            type="text"
            id="codigo"
            placeholder="MAT-1B-01"
            className={`block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${
              errors.codigo
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          {errors.codigo && (
            <p className="mt-1 text-sm text-red-600">{errors.codigo.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Formato: XXX-#X-## (ej: MAT-1B-01, LEN-2M-03)
          </p>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('descripcion')}
            id="descripcion"
            rows={3}
            placeholder="Describe el objetivo de aprendizaje..."
            className={`block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${
              errors.descripcion
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          {errors.descripcion && (
            <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
          )}
        </div>

        {/* Asignatura y Nivel en grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Asignatura */}
          <div>
            <label htmlFor="asignatura" className="block text-sm font-medium text-gray-700 mb-1">
              Asignatura <span className="text-red-500">*</span>
            </label>
            <input
              {...register('asignatura')}
              type="text"
              id="asignatura"
              placeholder="Matemática"
              className={`block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${
                errors.asignatura
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.asignatura && (
              <p className="mt-1 text-sm text-red-600">{errors.asignatura.message}</p>
            )}
          </div>

          {/* Nivel */}
          <div>
            <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
              Nivel <span className="text-red-500">*</span>
            </label>
            <input
              {...register('nivel')}
              type="text"
              id="nivel"
              placeholder="1B"
              className={`block w-full rounded-md shadow-sm sm:text-sm px-3 py-2 border ${
                errors.nivel
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.nivel && (
              <p className="mt-1 text-sm text-red-600">{errors.nivel.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Formato: #B, #M o #T (ej: 1B, 2M, 3T)
            </p>
          </div>
        </div>

        {/* Estado */}
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            {...register('estado')}
            id="estado"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Por defecto se crea como ACTIVO
          </p>
        </div>

        {/* Mensajes de error/éxito */}
        {submitError && (
          <div className="rounded-md bg-red-50 p-4">
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
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {submitSuccess && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  ¡Objetivo de aprendizaje creado exitosamente!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Creando...
              </>
            ) : (
              'Crear Objetivo de Aprendizaje'
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setSubmitError(null);
              setSubmitSuccess(false);
            }}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
