"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTokenRoute = updateTokenRoute;
const zod_1 = require("zod");
const update_token_controller_1 = require("@/controllers/tokens/update-token-controller");
async function updateTokenRoute(app) {
    app
        .withTypeProvider()
        .put('/token/:id', {
        schema: {
            tags: ['Tokens'],
            summary: 'Update token',
            params: zod_1.z.object({
                id: zod_1.z.coerce.number(),
            }),
            body: zod_1.z.object({
                token: zod_1.z.string(),
            }),
            response: {
                200: zod_1.z.object({
                    success: zod_1.z.boolean(),
                    message: zod_1.z.string().optional().nullish(),
                })
            },
        },
    }, update_token_controller_1.updateTokenController);
}
