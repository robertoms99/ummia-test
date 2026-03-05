import { GRAPHQL_ENDPOINT } from '@/mocks/handlers';
import type { GraphQLResponse } from '@/types/oa.types';

export async function graphqlRequest<TData = unknown, TVariables = unknown>(
  query: string,
  variables?: TVariables
): Promise<TData> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json: GraphQLResponse<TData> = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error('No data returned from GraphQL');
  }

  return json.data;
}

export const LIST_OA_QUERY = `
  query ListOA($pais: String!, $nextToken: String) {
    listOA(pais: $pais, nextToken: $nextToken) {
      items {
        id
        codigo
        descripcion
        nivel
        asignatura
        pais
        estado
        version
        updatedAt
        createdBy
      }
      nextToken
    }
  }
`;

export const CREATE_OA_MUTATION = `
  mutation CreateOA($input: CreateOAInput!) {
    createOA(input: $input) {
      id
      codigo
      descripcion
      nivel
      asignatura
      pais
      estado
      version
      updatedAt
      createdBy
    }
  }
`;
