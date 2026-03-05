// Tipos compartidos para Objetivos de Aprendizaje. En el entorno real podriamos usar un generador de tipos para GraphQL en base a los schemas remotos de AppSync

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
  estado?: OAEstado;
  createdBy?: string;
};

// Tipos para operaciones GraphQL
export type ListOAVariables = {
  pais: string;
  nextToken?: string | null;
};

export type CreateOAVariables = {
  input: CreateOAInput;
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
};
