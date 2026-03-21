"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vxRoutes = vxRoutes;
const vx_controller_1 = require("../../controllers/vx/vx-controller");
async function vxRoutes(app) {
    app.get('/vx/placas', vx_controller_1.vxController.getPlacas);
    app.get('/vx/logs', vx_controller_1.vxController.getLogs);
    app.get('/vx/status', vx_controller_1.vxController.getStatus);
    app.post('/vx/sincronizar', vx_controller_1.vxController.sincronizar);
    app.post('/vx/toggle', vx_controller_1.vxController.togglePlaca);
    app.post('/vx/executar', vx_controller_1.vxController.executarAgora);
    app.post('/vx/limpar-logs', vx_controller_1.vxController.limparLogs);
}
