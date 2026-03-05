// src/mocks/handlers.ts
// MSW handlers para simular AppSync GraphQL
import { graphql, HttpResponse } from 'msw';
import { listOA, createOA } from './mockOA';
import type { CreateOAInput } from './mockOA';

// GraphQL endpoint simulado (en producción sería el de AppSync)
const GRAPHQL_ENDPOINT = 'https://mock-appsync.amazonaws.com/graphql';

export const handlers = [
  // Handler para query ListOA
  graphql.query('ListOA', async ({ variables }) => {
    try {
      const { pais, nextToken } = variables as { pais: string; nextToken?: string | null };
      
      // Simular la llamada a la "API"
      const result = await listOA(pais, nextToken || null);
      
      return HttpResponse.json({
        data: {
          listOA: result,
        },
      });
    } catch (error) {
      return HttpResponse.json(
        {
          errors: [
            {
              message: error instanceof Error ? error.message : 'Error desconocido',
              path: ['listOA'],
            },
          ],
        },
        { status: 400 }
      );
    }
  }),

  // Handler para mutation CreateOA
  graphql.mutation('CreateOA', async ({ variables }) => {
    try {
      const { input } = variables as { input: CreateOAInput };
      
      // Simular la llamada a la "API"
      const result = await createOA(input);
      
      return HttpResponse.json({
        data: {
          createOA: result,
        },
      });
    } catch (error) {
      return HttpResponse.json(
        {
          errors: [
            {
              message: error instanceof Error ? error.message : 'Error desconocido',
              path: ['createOA'],
            },
          ],
        },
        { status: 400 }
      );
    }
  }),
];

export { GRAPHQL_ENDPOINT };
