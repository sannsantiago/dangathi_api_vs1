"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const bad_request_error_1 = require("@/errors/bad-request-error");
const unauthorized_error_1 = require("@/errors/unauthorized-error");
const errorHandler = (error, request, reply) => {
    if (error instanceof zod_1.ZodError) {
        reply.status(400).send({
            message: 'Validation error',
            errors: error.flatten().fieldErrors,
        });
    }
    if (error instanceof bad_request_error_1.BadRequestError) {
        reply.status(400).send({
            message: error.message,
        });
    }
    if (error instanceof unauthorized_error_1.UnauthorizedError) {
        reply.status(401).send({
            message: error.message,
        });
    }
    console.error(error);
    // send error to some observability platform
    reply.status(500).send({ message: 'Internal server error' });
};
exports.errorHandler = errorHandler;
