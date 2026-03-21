"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTokenController = void 0;
const prisma_1 = require("../../libs/prisma");
const updateTokenController = async (request, reply) => {
    const { id } = request.params;
    const { token } = request.body;
    const upsertToken = await prisma_1.prisma.token.upsert({
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
};
exports.updateTokenController = updateTokenController;
