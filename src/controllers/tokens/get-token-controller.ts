import { prisma } from "@/libs/prisma";
import { FastifyReply, FastifyRequest, RequestGenericInterface } from "fastify"

interface RequestInterface extends RequestGenericInterface {
  Params: {
    id: number,
  },
}

export const getTokenController = async (request: FastifyRequest<RequestInterface>, reply: FastifyReply) => {
  const { id } = request.params

  const token = await prisma.token.findUnique({
    where: { id },
    select: {
      token: true,
    }
  });
  const success = !!token;
  const message = success ? 'Token get successfully' : 'Failed to get token';
  return reply.status(200).send({ token: token?.token, success, message });
}

