require('dotenv').config()
import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from '@/error-handler'
import routesLoader from './routes'
import swaggerLoader from './loaders/swagger'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

swaggerLoader(app);


app.register(fastifyJwt, {
  secret: String(process.env.JWT_SECRET),
})

app.register(fastifyCors)
routesLoader(app);

app.get('/', (request, reply) => {
  reply.send({ hello: 'world' })
});

try {
  app.listen({ port: Number(process.env.SERVER_PORT), host: '0.0.0.0' }).then(() => {
    console.log(`HTTP server running in ${process.env.SERVER_PORT}!`)
  })
} catch (err) {
  console.log(err)
  process.exit(1)
}
