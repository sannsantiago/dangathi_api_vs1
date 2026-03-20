import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { getTokenController } from '@/controllers/tokens/get-token-controller'

export async function getTokenRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/token/:id',
      {
        schema: {
          tags: ['Tokens'],
          summary: 'Get token',
          params: z.object({
            id: z.coerce.number(),
          }),
          response: {
            200: z.object({
              token: z.string(),
              success: z.boolean(),
              message: z.string().optional().nullish(),
            })
          },
        },
      },
      getTokenController
    )
}
