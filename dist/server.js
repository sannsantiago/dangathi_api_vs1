"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const error_handler_1 = require("./error-handler");
const routes_1 = __importDefault(require("./routes"));
const swagger_1 = __importDefault(require("./loaders/swagger"));
const app = (0, fastify_1.default)().withTypeProvider();
app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
app.setErrorHandler(error_handler_1.errorHandler);
(0, swagger_1.default)(app);
// ✅ CORS CONFIGURADO (permitindo acesso do HTML)
app.register(cors_1.default, {
    origin: ['https://dangathi.com', 'https://www.dangathi.com'], // ← Assim
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});
app.register(jwt_1.default, {
    secret: String(process.env.JWT_SECRET),
});
(0, routes_1.default)(app);
app.get('/', (request, reply) => {
    reply.send({ hello: 'world' });
});
try {
    app.listen({ port: Number(process.env.PORT || 3000), host: '0.0.0.0' }).then(() => {
        console.log(`HTTP server running in ${process.env.PORT || 3000}!`);
    });
}
catch (err) {
    console.log(err);
    process.exit(1);
}
