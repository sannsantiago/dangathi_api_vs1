import { readFileSync } from 'node:fs'
// import path from 'node:path'

import { FastifyInstance } from "fastify";
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import {
  jsonSchemaTransform,
} from 'fastify-type-provider-zod'

type FastifyLoaderHandler = FastifyInstance['server']

export default function swaggerLoader(app: FastifyLoaderHandler | any) {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Dangathi API',
        description: 'Dangathi web application for human resources management.',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  })

  // const file = path.resolve(path.dirname(''), 'src', 'a71ab1ab51c804cd0aeea6aea66ae909.png')
  const contents = readFileSync('./src/assets/logo.png', 'base64')
  const icon = readFileSync('./src/assets/favicon.ico', 'base64')

  app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (_: any, _reply: any, next: any) { next() },
      preHandler: function (_: any, _reply: any, next: any) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header: any) => header,
    transformSpecification: (swaggerObject: any, _request: any, _reply: any) => { return swaggerObject },
    transformSpecificationClone: true,
    logo: {
      type: 'image/png',
      content: Buffer.from(contents, 'base64')
    },
    theme: {
      title: 'Dangathi API',
      css: [
        { filename: 'theme.css', content: '.swagger-ui img { height: 80px }' }
      ],
      favicon: [
        {
          filename: 'favicon.ico',
          rel: 'icon',
          sizes: '16x16',
          type: 'image/ico',
          content: Buffer.from(icon, 'base64')
        }
      ]
    }
  })
}