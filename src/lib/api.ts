/**
 * Funciones de API para interactuar con el backend GraphQL
 * Estas funciones son utilizadas por React Query
 */

import { graphqlRequest, LIST_OA_QUERY, CREATE_OA_MUTATION } from './graphql-client';
import type {
  OA,
  ListOAResult,
  CreateOAInput,
  ListOAVariables,
  CreateOAVariables,
} from '@/types/oa.types';

/**
 * Fetch OA list con paginación
 */
export async function fetchOAList(
  pais: string,
  nextToken?: string | null
): Promise<ListOAResult> {
  const variables: ListOAVariables = {
    pais,
    nextToken: nextToken || undefined,
  };

  const response = await graphqlRequest<{ listOA: ListOAResult }>(
    LIST_OA_QUERY,
    variables
  );

  return response.listOA;
}

/**
 * Crear nuevo OA
 */
export async function createOA(input: CreateOAInput): Promise<OA> {
  const variables: CreateOAVariables = { input };

  const response = await graphqlRequest<{ createOA: OA }>(
    CREATE_OA_MUTATION,
    variables
  );

  return response.createOA;
}
