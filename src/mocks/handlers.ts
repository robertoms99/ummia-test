import { graphql, HttpResponse } from 'msw';
import { listOA, createOA } from './mockOA';
import type { CreateOAInput } from './mockOA';

// GraphQL endpoint simulado (en producción sería el de AppSync)
const GRAPHQL_ENDPOINT = 'https://mock-appsync.amazonaws.com/graphql';

export const handlers = [
  graphql.query('ListOA', async ({ variables }) => {
    try {
      const { pais, nextToken } = variables as { pais: string; nextToken?: string | null };

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

  graphql.mutation('CreateOA', async ({ variables }) => {
    try {
      const { input } = variables as { input: CreateOAInput };

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
