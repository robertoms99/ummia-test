// src/schemas/oa.schema.ts
// Esquemas de validación Zod para OA
import { z } from 'zod';

export const createOASchema = z.object({
  codigo: z
    .string()
    .min(1, 'El código es requerido')
    .max(20, 'El código no puede exceder 20 caracteres')
    .regex(
      /^[A-Z]{3}-[0-9][A-Z]-[0-9]{2}$/,
      'El código debe seguir el formato: XXX-#X-##  (ej: MAT-1B-01)'
    ),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  nivel: z
    .string()
    .min(1, 'El nivel es requerido')
    .regex(/^[0-9][BMT]$/, 'El nivel debe seguir el formato: #B, #M o #T (ej: 1B, 2M)'),
  asignatura: z
    .string()
    .min(1, 'La asignatura es requerida')
    .max(50, 'La asignatura no puede exceder 50 caracteres'),
  estado: z.enum(['ACTIVO', 'INACTIVO']).default('ACTIVO'),
  createdBy: z.string().optional(),
});

export type CreateOAFormData = z.infer<typeof createOASchema>;
