// src/mocks/mockOA.ts
// Mock API para simular GraphQL ListOA / CreateOA en 2 páginas con edge cases.
// No requiere AWS Amplify real.

export type OAEstado = "ACTIVO" | "INACTIVO";

export type OA = {
  id: string;
  codigo: string;
  descripcion: string;
  nivel: string;
  asignatura: string;
  pais: string;
  estado: OAEstado;
  version: number;
  updatedAt: string; // ISO
  createdBy: string;
};

export type ListOAResult = {
  items: OA[];
  nextToken: string | null;
};

export type CreateOAInput = {
  codigo: string;
  descripcion: string;
  nivel: string;
  asignatura: string;
  pais: string;
  // opcional: permitir que creen inactivo si quieren simular workflow
  estado?: OAEstado;
  createdBy?: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Datos en memoria (simulan DynamoDB)
const PAGES: Record<string, ListOAResult> = {
  PAGE_1: {
    items: [
      {
        id: "oa-001-v1",
        codigo: "MAT-1B-01",
        descripcion: "Resolver sumas básicas",
        nivel: "1B",
        asignatura: "Matemática",
        pais: "CL",
        estado: "INACTIVO",
        version: 1,
        updatedAt: "2024-01-01T10:00:00Z",
        createdBy: "admin_cl",
      },
      {
        id: "oa-001-v2",
        codigo: "MAT-1B-01",
        descripcion: "Resolver sumas básicas",
        nivel: "1B",
        asignatura: "Matemática",
        pais: "CL",
        estado: "ACTIVO",
        version: 2,
        updatedAt: "2024-02-01T10:00:00Z",
        createdBy: "admin_cl",
      },
      {
        id: "oa-002-v1",
        codigo: "LEN-1B-02",
        descripcion: "Comprender textos breves",
        nivel: "1B",
        asignatura: "Lenguaje",
        pais: "CL",
        estado: "ACTIVO",
        version: 1,
        updatedAt: "2024-01-15T09:00:00Z",
        createdBy: "admin_cl",
      },
      {
        id: "oa-003-v1",
        codigo: "CIE-2M-05",
        descripcion: "Identificar partes de una célula",
        nivel: "2M",
        asignatura: "Ciencias",
        pais: "CL",
        estado: "INACTIVO",
        version: 1,
        updatedAt: "2024-03-01T08:30:00Z",
        createdBy: "admin_cl",
      },
      // Registro de otro país para validar multi-tenant
      {
        id: "oa-co-001-v1",
        codigo: "MAT-1B-01",
        descripcion: "Resolver sumas básicas (CO)",
        nivel: "1B",
        asignatura: "Matemáticas",
        pais: "CO",
        estado: "ACTIVO",
        version: 1,
        updatedAt: "2024-02-10T10:00:00Z",
        createdBy: "admin_co",
      },
    ],
    nextToken: "PAGE_2",
  },
  PAGE_2: {
    items: [
      {
        id: "oa-002-v2",
        codigo: "LEN-1B-02",
        descripcion: "Comprender textos breves (ajuste)",
        nivel: "1B",
        asignatura: "Lenguaje",
        pais: "CL",
        estado: "INACTIVO",
        version: 2,
        updatedAt: "2024-02-20T11:00:00Z",
        createdBy: "admin_cl",
      },
      {
        id: "oa-002-v3",
        codigo: "LEN-1B-02",
        descripcion: "Comprender textos breves (versión final)",
        nivel: "1B",
        asignatura: "Lenguaje",
        pais: "CL",
        estado: "ACTIVO",
        version: 3,
        updatedAt: "2024-03-05T11:00:00Z",
        createdBy: "admin_cl",
      },
      // Edge case: versión más alta INACTIVA, debería mostrarse la última ACTIVA (v1)
      {
        id: "oa-004-v1",
        codigo: "HIS-2M-03",
        descripcion: "Analizar procesos históricos",
        nivel: "2M",
        asignatura: "Historia",
        pais: "CL",
        estado: "ACTIVO",
        version: 1,
        updatedAt: "2024-01-20T12:00:00Z",
        createdBy: "admin_cl",
      },
      {
        id: "oa-004-v2",
        codigo: "HIS-2M-03",
        descripcion: "Analizar procesos históricos (borrador)",
        nivel: "2M",
        asignatura: "Historia",
        pais: "CL",
        estado: "INACTIVO",
        version: 2,
        updatedAt: "2024-02-20T12:00:00Z",
        createdBy: "admin_cl",
      },
      {
        id: "oa-005-v1",
        codigo: "MAT-2M-03",
        descripcion: "Resolver ecuaciones cuadráticas",
        nivel: "2M",
        asignatura: "Matemática",
        pais: "CL",
        estado: "ACTIVO",
        version: 1,
        updatedAt: "2024-04-01T10:00:00Z",
        createdBy: "admin_cl",
      },
    ],
    nextToken: null,
  },
};

// Estructura de almacenamiento plana para simular “tabla”
let store: OA[] = [...PAGES.PAGE_1.items, ...PAGES.PAGE_2.items];

/**
 * Simula la query ListOA(pais, nextToken).
 * - Filtra por pais
 * - Devuelve páginas (PAGE_1 / PAGE_2)
 * - Agrega latencia artificial
 */
export async function listOA(pais: string, nextToken: string | null = "PAGE_1"): Promise<ListOAResult> {
  await sleep(450);

  const token = nextToken ?? "PAGE_1";
  const page = PAGES[token];

  if (!page) {
    // token inválido: en la vida real vendría un error desde AppSync
    throw new Error("Invalid nextToken");
  }

  const items = page.items.filter((x) => x.pais === pais);
  return { items, nextToken: page.nextToken };
}

/**
 * Simula la mutation CreateOA(input).
 * - Crea un nuevo registro con version incrementada si existe el mismo codigo en el mismo pais
 * - Por defecto crea estado ACTIVO
 */
export async function createOA(input: CreateOAInput): Promise<OA> {
  await sleep(350);

  const now = new Date().toISOString();
  const createdBy = input.createdBy ?? `user_${input.pais.toLowerCase()}`;
  const estado = input.estado ?? "ACTIVO";

  const sameCode = store.filter((x) => x.pais === input.pais && x.codigo === input.codigo);
  const nextVersion = sameCode.length ? Math.max(...sameCode.map((x) => x.version)) + 1 : 1;

  const oa: OA = {
    id: `${input.codigo.toLowerCase()}-v${nextVersion}`,
    codigo: input.codigo,
    descripcion: input.descripcion,
    nivel: input.nivel,
    asignatura: input.asignatura,
    pais: input.pais,
    estado,
    version: nextVersion,
    updatedAt: now,
    createdBy,
  };

  store = [oa, ...store];

  return oa;
}

/**
 * Utilidad opcional: resetea el store al estado inicial (útil en tests).
 */
export function resetMockStore() {
  store = [...PAGES.PAGE_1.items, ...PAGES.PAGE_2.items];
}
