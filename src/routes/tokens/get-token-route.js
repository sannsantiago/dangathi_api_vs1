"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenRoute = getTokenRoute;
const zod_1 = require("zod");
const get_token_controller_1 = require("@/controllers/tokens/get-token-controller");
async function getTokenRoute(app) {
    app
        .withTypeProvider()
        .get('/token/:id', {
        schema: {
            tags: ['Tokens'],
            summary: 'Get token',
            params: zod_1.z.object({
                id: zod_1.z.coerce.number(),
            }),
            response: {
                200: zod_1.z.object({
                    token: zod_1.z.string(),
                    success: zod_1.z.boolean(),
                    message: zod_1.z.string().optional().nullish(),
                })
            },
        },
    }, get_token_controller_1.getTokenController);
}
