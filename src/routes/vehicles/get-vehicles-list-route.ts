import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { getVehiclesListController } from '@/controllers/vehicles/get-vehicles-list-controller'

export async function getVehiclesListRoute(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      '/vehicles/list',
      {
        schema: {
          tags: ['Vehicles'],
          summary: 'Get list vehicles',
          // querystring: z.object({
          //   token: z.string(),
          // }),
          response: {
            200: z.object({
              vehicles: z.array(
                z.object({
                  id: z.coerce.number(),
                  name: z.string().optional().nullish(),
                  plate: z.string().optional().nullish(),
                  latitude: z.coerce.number().optional().nullish(),
                  longitude: z.coerce.number().optional().nullish(),
                  date: z.string().optional().nullish(),
                }),
              ).optional().nullish(),
              success: z.boolean(),
              message: z.string().optional().nullish(),
            })
          },
        },
      },
      getVehiclesListController
    )
}
