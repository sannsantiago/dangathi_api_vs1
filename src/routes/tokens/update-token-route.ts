import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { updateTokenController } from '@/controllers/tokens/update-token-controller'

export async function updateTokenRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .put(
      '/token/:id',
      {
        schema: {
          tags: ['Tokens'],
          summary: 'Update token',
          params: z.object({
            id: z.coerce.number(),
          }),
          body: z.object({
            token: z.string(),
          }),
          response: {
            200: z.object({
              success: z.boolean(),
              message: z.string().optional().nullish(),
            })
          },
        },
      },
      updateTokenController
    )
}
