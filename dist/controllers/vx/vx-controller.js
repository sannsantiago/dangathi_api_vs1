"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vxController = void 0;
const prisma_1 = require("@/libs/prisma");
let cachePlacas = [];
let logs = [];
let contadorExecucoes = 0;
exports.vxController = {
    async getPlacas(request, reply) {
        return reply.send(cachePlacas);
    },
    async getLogs(request, reply) {
        return reply.send(logs.slice().reverse());
    },
    async getStatus(request, reply) {
        const ativas = cachePlacas.filter((p) => p.ativa && !p.removida).length;
        return reply.send({
            total_placas: cachePlacas.length,
            ativas: ativas,
            inativas: cachePlacas.length - ativas,
            ultima_sincronizacao: new Date().toISOString(),
            ultimo_envio: logs.length > 0 ? logs[logs.length - 1].datahora : null,
            proximo_envio_em: 3 - (contadorExecucoes % 3)
        });
    },
    async sincronizar(request, reply) {
        try {
            const tokenData = await prisma_1.prisma.token.findFirst({ where: { id: 1 } });
            if (!(tokenData === null || tokenData === void 0 ? void 0 : tokenData.token)) {
                return reply.status(400).send({ error: 'Token Wialon não configurado' });
            }
            const loginUrl = `${process.env.WIALON_API_URL}?svc=token/login&params=${encodeURIComponent(JSON.stringify({ token: tokenData.token }))}`;
            const loginRes = await fetch(loginUrl);
            const loginData = await loginRes.json();
            if (!loginData.eid) {
                return reply.status(400).send({ error: 'Falha no login Wialon' });
            }
            const unitsUrl = `${process.env.WIALON_API_URL}?svc=core/search_items&params=${encodeURIComponent(JSON.stringify({
                spec: { itemsType: "avl_unit", propName: "sys_name", propValueMask: "*", sortType: "sys_name" },
                force: 1, flags: 1025, from: 0, to: 1000
            }))}&sid=${loginData.eid}`;
            const unitsRes = await fetch(unitsUrl);
            const unitsData = await unitsRes.json();
            const unidades = unitsData.items || [];
            let novas = 0;
            let reativadas = 0;
            unidades.forEach((unit) => {
                const placa = unit.nm.toUpperCase();
                const existing = cachePlacas.find((p) => p.placa === placa);
                if (!existing) {
                    cachePlacas.push({
                        placa: placa,
                        placa_limpa: placa.substring(0, 7),
                        descricao: placa.substring(8) || 'Veículo',
                        ativa: true,
                        removida: false,
                        unitId: unit.id,
                        ultima_lat: null,
                        ultima_lon: null,
                        ultima_data: null
                    });
                    novas++;
                }
                else {
                    if (existing.removida) {
                        existing.removida = false;
                        existing.ativa = true;
                        reativadas++;
                    }
                    existing.unitId = unit.id;
                }
            });
            return reply.send({
                success: true,
                total: cachePlacas.length,
                novas: novas,
                reativadas: reativadas
            });
        }
        catch (error) {
            return reply.status(500).send({ error: error.message });
        }
    },
    async togglePlaca(request, reply) {
        const body = request.body;
        const placa = body.placa;
        const p = cachePlacas.find((p) => p.placa === placa);
        if (!p) {
            return reply.status(404).send({ success: false, message: 'Placa não encontrada' });
        }
        p.ativa = !p.ativa;
        return reply.send({ success: true, ativa: p.ativa });
    },
    async executarAgora(request, reply) {
        var _a;
        contadorExecucoes++;
        try {
            const tokenData = await prisma_1.prisma.token.findFirst({ where: { id: 1 } });
            if (!(tokenData === null || tokenData === void 0 ? void 0 : tokenData.token)) {
                return reply.status(400).send({ error: 'Token Wialon não configurado' });
            }
            const host = request.headers.host || `localhost:${process.env.SERVER_PORT}`;
            const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
            const response = await fetch(`${protocol}://${host}/vehicles/list`);
            const data = await response.json();
            if (data.vehicles) {
                data.vehicles.forEach((v) => {
                    // CORREÇÃO: Garante que usa a placa correta (do controller vehicles)
                    const placa = v.plate;
                    const p = cachePlacas.find((cp) => cp.placa === placa || cp.placa_limpa === (placa === null || placa === void 0 ? void 0 : placa.substring(0, 7)));
                    if (p) {
                        p.ultima_lat = v.latitude;
                        p.ultima_lon = v.longitude;
                        p.ultima_data = v.date;
                    }
                });
            }
            // CORREÇÃO: Filtra só veículos que têm placa válida para o log
            const veiculosValidos = ((_a = data.vehicles) === null || _a === void 0 ? void 0 : _a.filter((v) => v.plate && !v.plate.startsWith('SEM_PLACA'))) || [];
            const log = {
                datahora: new Date().toLocaleString('pt-BR'),
                placas_enviadas: veiculosValidos.length,
                placas_lista: veiculosValidos.map((v) => v.plate).join(', '), // ← Agora sempre terá as 3 placas
                status_http: response.status,
                sucesso: data.success,
                resposta: data.message
            };
            logs.push(log);
            return reply.send({
                success: true,
                placasEnviadas: veiculosValidos.length,
                payload: data.vehicles, // Retorna todas, mas o log mostra só válidas
                vxResponse: data
            });
        }
        catch (error) {
            return reply.status(500).send({ success: false, error: error.message });
        }
    },
    async limparLogs(request, reply) {
        logs = [];
        return reply.send({ success: true, message: 'Logs limpos' });
    }
};
