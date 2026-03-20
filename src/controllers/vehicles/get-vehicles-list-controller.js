"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVehiclesListController = void 0;
const prisma_1 = require("@/libs/prisma");
function timestampToDateHourPtBr(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}
const getVehiclesListController = async (request, reply) => {
    var _a;
    try {
        // Buscar token do banco
        const tokenResult = await prisma_1.prisma.token.findFirst({
            where: { id: 1 },
            select: { token: true },
        });
        if (!(tokenResult === null || tokenResult === void 0 ? void 0 : tokenResult.token)) {
            return reply.status(400).send({
                success: false,
                message: 'Token Wialon não encontrado no banco de dados',
            });
        }
        const token = tokenResult.token;
        // Login no Wialon
        const loginUrl = `${process.env.WIALON_API_URL}?svc=token/login&params=${encodeURIComponent(JSON.stringify({ token, fl: 1 }))}`;
        const loginRes = await fetch(loginUrl);
        const loginData = await loginRes.json();
        if (loginData.error) {
            return reply.status(400).send({
                success: false,
                message: `Erro login Wialon: ${loginData.error}`,
            });
        }
        const { eid } = loginData;
        // Buscar lista de veículos (monu)
        const listUrl = `${process.env.WIALON_API_URL}?svc=core/duplicate&${new URLSearchParams({
            params: JSON.stringify({ operateAs: "", continueCurrentSession: false, checkService: "hosting_wialon_us", restore: 1, appName: "web/hosting.wialon.us" }),
            sid: eid
        })}`;
        const listRes = await fetch(listUrl, { method: 'POST' });
        const listData = await listRes.json();
        if (listData.error) {
            return reply.status(400).send({
                success: false,
                message: `Erro ao listar veículos: ${listData.error}`,
            });
        }
        const user = listData.user || {};
        // VALIDAÇÃO CRÍTICA: Verificar se existe prp.monu
        if (!((_a = user.prp) === null || _a === void 0 ? void 0 : _a.monu)) {
            return reply.status(400).send({
                success: false,
                message: 'Nenhum veículo encontrado na conta Wialon',
            });
        }
        let vehiclesList = [];
        try {
            vehiclesList = JSON.parse(user.prp.monu);
            if (!Array.isArray(vehiclesList)) {
                throw new Error('Formato inválido');
            }
        }
        catch (e) {
            return reply.status(400).send({
                success: false,
                message: 'Erro ao parsear lista de veículos do Wialon',
            });
        }
        // Buscar informações detalhadas
        const infoUrl = `${process.env.WIALON_API_URL}?svc=core/update_data_flags&${new URLSearchParams({
            params: JSON.stringify({ spec: [{ type: "col", data: vehiclesList, flags: 4294967295, mode: 1 }] }),
            sid: eid
        })}`;
        const infoRes = await fetch(infoUrl, { method: 'POST' });
        const infoData = await infoRes.json();
        if (infoData.error) {
            return reply.status(400).send({
                success: false,
                message: `Erro ao buscar dados dos veículos: ${infoData.error}`,
            });
        }
        // Mapear veículos com proteção contra dados incompletos
        const vehicles = vehiclesList.map((vehicleId) => {
            var _a, _b, _c;
            const info = infoData === null || infoData === void 0 ? void 0 : infoData.find((item) => item.i === vehicleId);
            if (!(info === null || info === void 0 ? void 0 : info.d)) {
                return {
                    id: vehicleId,
                    name: `Veículo ${vehicleId}`,
                    plate: null,
                    latitude: null,
                    longitude: null,
                    date: null,
                };
            }
            // Buscar placa nos campos personalizados (pflds)
            let plate = null;
            if (info.d.pflds) {
                const plateField = Object.values(info.d.pflds).find((item) => item.n === 'registration_plate');
                plate = plateField ? plateField.v : null;
            }
            const timestamp = (_a = info.d.pos) === null || _a === void 0 ? void 0 : _a.t;
            const dateStr = timestamp ? timestampToDateHourPtBr(timestamp).replace(',', '') : null;
            return {
                id: vehicleId,
                name: info.d.nm || `Veículo ${vehicleId}`,
                plate: plate,
                latitude: ((_b = info.d.pos) === null || _b === void 0 ? void 0 : _b.y) || null,
                longitude: ((_c = info.d.pos) === null || _c === void 0 ? void 0 : _c.x) || null,
                date: dateStr,
            };
        });
        // Enviar para VX Consult
        let success = false;
        let message = '';
        let vxResponse = null;
        if (vehicles.length > 0 && process.env.CONSULT_API) {
            const consultData = vehicles.map(v => ({
                placa: v.plate,
                latitude: v.latitude,
                longitude: v.longitude,
                datahora: v.date,
            }));
            try {
                const sendRes = await fetch(process.env.CONSULT_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.CONSULT_API_KEY}`,
                    },
                    body: JSON.stringify(consultData),
                });
                vxResponse = await sendRes.json();
                if (vxResponse === null || vxResponse === void 0 ? void 0 : vxResponse.success) {
                    success = true;
                    message = vxResponse.message || 'Dados enviados com sucesso para VX Consult';
                }
                else {
                    success = false;
                    message = (vxResponse === null || vxResponse === void 0 ? void 0 : vxResponse.message) || 'Falha ao enviar para VX Consult';
                }
            }
            catch (error) {
                console.error('Erro ao enviar para VX:', error);
                success = false;
                message = `Erro na comunicação: ${error.message}`;
            }
        }
        else {
            message = 'Nenhum veículo para enviar ou CONSULT_API não configurada';
        }
        return reply.status(200).send({
            vehicles,
            success,
            message,
            vxResponse: process.env.NODE_ENV === 'dev' ? vxResponse : undefined // Só mostra em dev
        });
    }
    catch (error) {
        console.error('Erro geral:', error);
        return reply.status(500).send({
            success: false,
            message: `Erro interno: ${error.message}`,
            vehicles: [],
        });
    }
};
exports.getVehiclesListController = getVehiclesListController;
