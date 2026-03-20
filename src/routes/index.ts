import { FastifyInstance } from "fastify";
import { getVehiclesListRoute } from "./vehicles/get-vehicles-list-route";
import { updateTokenRoute } from "./tokens/update-token-route";
import { getTokenRoute } from "./tokens/get-token-route";
import { vxRoutes } from "./vx/vx-routes";

type FastifyLoaderHandler = FastifyInstance['server']

export default function routesLoader(app: FastifyLoaderHandler | any) {
  app.register(getVehiclesListRoute)
  app.register(updateTokenRoute)
  app.register(getTokenRoute)
  app.register(vxRoutes)
}