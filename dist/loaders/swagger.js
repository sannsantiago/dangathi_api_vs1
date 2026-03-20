"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = swaggerLoader;
const node_fs_1 = require("node:fs");
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
function swaggerLoader(app) {
    app.register(swagger_1.default, {
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
        transform: fastify_type_provider_zod_1.jsonSchemaTransform,
    });
    // const file = path.resolve(path.dirname(''), 'src', 'a71ab1ab51c804cd0aeea6aea66ae909.png')
    const contents = (0, node_fs_1.readFileSync)('./src/assets/logo.png', 'base64');
    const icon = (0, node_fs_1.readFileSync)('./src/assets/favicon.ico', 'base64');
    app.register(swagger_ui_1.default, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false
        },
        uiHooks: {
            onRequest: function (_, _reply, next) { next(); },
            preHandler: function (_, _reply, next) { next(); }
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, _request, _reply) => { return swaggerObject; },
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
    });
}
