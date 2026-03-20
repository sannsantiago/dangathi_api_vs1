import 'fastify'

import type { Member, Tenant } from '@prisma/client'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMembership(
      slug: string
    ): Promise<{ tenant: Tenant; membership: Member }>
  }
}
