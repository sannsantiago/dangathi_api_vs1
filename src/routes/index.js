"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routesLoader;
const get_vehicles_list_route_1 = require("./vehicles/get-vehicles-list-route");
const update_token_route_1 = require("./tokens/update-token-route");
const get_token_route_1 = require("./tokens/get-token-route");
function routesLoader(app) {
    app.register(get_vehicles_list_route_1.getVehiclesListRoute);
    app.register(update_token_route_1.updateTokenRoute);
    app.register(get_token_route_1.getTokenRoute);
}
