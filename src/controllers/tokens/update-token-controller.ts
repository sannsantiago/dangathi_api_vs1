import { prisma } from "@/libs/prisma";
import { FastifyReply, FastifyRequest, RequestGenericInterface } from "fastify"

interface RequestInterface extends RequestGenericInterface {
  Params: {
    id: number,
  },
  Body: {
    token: string,
  },
}

export const updateTokenController = async (request: FastifyRequest<RequestInterface>, reply: FastifyReply) => {
  const { id } = request.params
  const { token } = request.body

  const upsertToken = await prisma.token.upsert({
    where: { id },
    update: {
      token,
    },
    create: {
      id,
      token,
    },
  });
  const success = !!upsertToken;
  const message = success ? 'Token updated successfully' : 'Failed to update token';
  return reply.status(200).send({ success, message });
}

