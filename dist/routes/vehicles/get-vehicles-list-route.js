"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVehiclesListRoute = getVehiclesListRoute;
const zod_1 = require("zod");
const get_vehicles_list_controller_1 = require("../../controllers/vehicles/get-vehicles-list-controller");
async function getVehiclesListRoute(app) {
    app
        .withTypeProvider()
        .get('/vehicles/list', {
        schema: {
            tags: ['Vehicles'],
            summary: 'Get list vehicles',
            // querystring: z.object({
            //   token: z.string(),
            // }),
            response: {
                200: zod_1.z.object({
                    vehicles: zod_1.z.array(zod_1.z.object({
                        id: zod_1.z.coerce.number(),
                        name: zod_1.z.string().optional().nullish(),
                        plate: zod_1.z.string().optional().nullish(),
                        latitude: zod_1.z.coerce.number().optional().nullish(),
                        longitude: zod_1.z.coerce.number().optional().nullish(),
                        date: zod_1.z.string().optional().nullish(),
                    })).optional().nullish(),
                    success: zod_1.z.boolean(),
                    message: zod_1.z.string().optional().nullish(),
                })
            },
        },
    }, get_vehicles_list_controller_1.getVehiclesListController);
}
