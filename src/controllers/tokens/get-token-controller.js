"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenController = void 0;
const prisma_1 = require("@/libs/prisma");
const getTokenController = async (request, reply) => {
    const { id } = request.params;
    const token = await prisma_1.prisma.token.findUnique({
        where: { id },
        select: {
            token: true,
        }
    });
    const success = !!token;
    const message = success ? 'Token get successfully' : 'Failed to get token';
    return reply.status(200).send({ token: token === null || token === void 0 ? void 0 : token.token, success, message });
};
exports.getTokenController = getTokenController;
