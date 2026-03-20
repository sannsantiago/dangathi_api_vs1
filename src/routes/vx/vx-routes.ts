import type { FastifyInstance } from 'fastify';
import { vxController } from '@/controllers/vx/vx-controller';

export async function vxRoutes(app: FastifyInstance) {
  app.get('/vx/placas', vxController.getPlacas);
  app.get('/vx/logs', vxController.getLogs);
  app.get('/vx/status', vxController.getStatus);
  app.post('/vx/sincronizar', vxController.sincronizar);
  app.post('/vx/toggle', vxController.togglePlaca);
  app.post('/vx/executar', vxController.executarAgora);
  app.post('/vx/limpar-logs', vxController.limparLogs);
}